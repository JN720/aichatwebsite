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

async function updateTitle(title: string, id: string) {
    kv.hset('c:' + id, {title: title});
    return client.sql`UPDATE Chats SET title = ${title} WHERE cid = ${parseInt(id)}`.then(() => {
        return 'success';
    }).catch(() => {
        return 'error';
    })
}

async function addChat(msgs: string, title: string, id: string) {
    const { rows } = await client.sql`INSERT INTO Chats(title, msgs, uid) VALUES(${title}, ${msgs}, ${parseInt(id)}) RETURNING cid;`;
    kv.lpush('i:' + id, rows[0].cid);
    kv.hset('c:' + rows[0].cid, {msgs: msgs, title: title});
    return rows[0].cid.toString();
}

export async function PUT(req: Request) {
    const request = await req.json();
    const status = await request.status;
    const type = await request.type;
    
    try {
        switch (type) {
            case 'msg':
                const text = await request.text;
                const form = new FormData();
                form.append('instruction', 'Instruction: Respond intelligently.');
                form.append('knowledge', 'Knowledge: You are helpful.');
                form.append('dialog', text);
                const msg = await axios.post(process.env.GEN_URL ?? 'http://localhost:8000', form)
                if (status == 'authenticated') {
                    const id = await request.id;
                    const title = await request.title;
                    await updateChat(text + msg.data.message + ' EOS ', title, id);
                }
                return NextResponse.json({message: msg.data.message});
            case 'title':
                const id = await request.id;
                const title = await request.title;
                const result = await updateTitle(title, id);
                return NextResponse.json({message: result});
            case 'add':
                const uid = await request.id;
                const newTitle = await request.title;
                const newText = await request.text;
                const cid = await addChat(newText, newTitle, uid);
                console.log(cid)
                return NextResponse.json({cid: cid});
        }
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
                return {uid: uid, titles: titles, chats: chats, ids: ids};
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
    try {
        const res = await getAndCache(email);
        return NextResponse.json(res);
    } catch(e) {
        await connectClient();
        const res = await getAndCache(email);
        return NextResponse.json(res);
    }
}

