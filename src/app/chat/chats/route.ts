import axios from 'axios';
import { kv } from "@vercel/kv";
import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";

let client: any;
const TTL = 3600;

db.on('connect', () => {
    console.log(':D');
})

db.on('error', () => {
    console.log('D;');
})

async function connectClient() {
    client = await db.connect();
}

async function updateChat(msgs: string, title: string, id: string) {
    kv.hset('c:' + id, {msgs: msgs, title: title});
    client.sql`UPDATE Chats SET msgs = ${msgs} WHERE cid = ${parseInt(id)};`;
}

export async function PUT(req: Request) {
    const request = await req.json();
    const status = await request.status;
    const text = await request.text;
    const id = await request.id;
    const title = await request.title;
    const form = new FormData();
    form.append('instruction', 'Instruction: Respond intelligently.');
    form.append('knowledge', 'Knowledge: You are helpful.');
    form.append('dialog', text);
    try {
        const msg = await axios.post(process.env.GEN_URL ?? 'http://localhost:8000', form)
        if (status == 'authenticated') {
            await updateChat(text + msg.data.message + ' EOS ', title, id.toString());
        }
        return NextResponse.json({message: msg.data.message});
    } catch(e) {
        return NextResponse.json({});
    }
}

async function getAndCache(email: string) {
    let titles: string[] = [];
    let chats: string[] = [];
    let ids: string[] = [];
    let uid = '';
    try {
        const uid = await kv.hget('e:' + email, 'id');
        const ids = await kv.lrange('i:' + await uid, 0, -1);
        for(let i = 0; i < ids.length; i++) {
            const msgs = await kv.hget('c:' + ids[i], 'msgs')
            if (typeof msgs != 'string') {
                throw 'Cache Miss';
            }
            chats.push(msgs);
            const title = await kv.hget('c:' + ids[i], 'title');
            if (typeof title != 'string') {
                throw 'Cache Miss';
            }
            titles.push(msgs);
            if (i == ids.length) {
                console.log('cache hit')
                return {uid: uid, titles: titles, chats: chats, ids: ids, e: 4};
            }
        }
        
    } catch(e) {
        console.error('Cache Error');
    }
    titles = [];
    chats = [];
    ids = [];
    try {
        const { rows } = await client.sql`SELECT Users.id AS uid, Chats.cid AS cid, Chats.title AS title, Chats.msgs AS msgs FROM Users JOIN Chats ON Users.id = Chats.uid WHERE Users.email = ${email} ORDER BY Chats.creation;`;
        uid = rows[0].uid;
        rows.forEach((chat: any) => {
            titles.push(chat.title);
            chats.push(chat.msgs);
            ids.push(chat.cid);
        })
        kv.del('i:' + uid);
        kv.rpush('i:' + uid, ids);
        kv.expire('i:' + uid, parseInt(process.env.TTL ?? TTL.toString()));
        kv.hset('e:' + email, {id: uid});
        rows.forEach((chat: any) => {
            kv.hset('c:' + chat.cid, {msgs: chat.msgs, title: chat.title});
            kv.expire('c:' + chat.cid, parseInt(process.env.TTL ?? TTL.toString()));
        })
        return {uid: uid, titles: titles, chats: chats, ids: ids};
    } catch(e) {
        return;
    }
    
}

export async function POST(req: Request) {
    const request = await req.json();
    const email = await request.email;
    let titles: string[] = [];
    let chats: string[] = [];
    let ids: string[] = [];
    try {
        const res = await getAndCache(email);
        return NextResponse.json(res);
    } catch(e) {
        await connectClient();
        const res = await getAndCache(email);
        return NextResponse.json(res);
    }
}

