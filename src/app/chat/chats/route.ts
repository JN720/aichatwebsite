import axios from 'axios';
import { kv } from "@vercel/kv";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

const TTL = 3600;

async function updateChat(msgs: string, title: string, id: string) {
    kv.hset('c:' + id, {msgs: msgs, title: title});
    sql`UPDATE Chats SET msgs = ${msgs} WHERE cid = ${parseInt(id)};`;
}

async function updateTitle(title: string, id: string) {
    kv.hset('c:' + id, {title: title});
    return sql`UPDATE Chats SET title = ${title} WHERE cid = ${parseInt(id)}`.then(() => {
        return 'success';
    }).catch(() => {
        return 'error';
    })
}

async function addChat(msgs: string, title: string, id: string) {
    const { rows } = await sql`INSERT INTO Chats(title, msgs, uid) VALUES(${title}, ${msgs}, ${parseInt(id)}) RETURNING cid;`;
    if (!rows[0].cid) {
        throw 'Failed to Add';
    }
    kv.lpush('i:' + id, rows[0].cid);
    kv.hset('c:' + rows[0].cid, {msgs: msgs, title: title});
    return rows[0].cid.toString();
}

 async function put(request: any) {
    const status = await request.status;
    const type = await request.type;
    switch (type) {
        case 'msg':
            const text = await request.text;
            const form = new FormData();
            form.append('instruction', 'Instruction: Respond intelligently.');
            form.append('knowledge', 'Knowledge: You are helpful.');
            form.append('dialog', text);
            const msg = await axios.post(process.env.GEN_URL ?? 'http://localhost:8000', form);
            if (status == 'authenticated') {
                const id = await request.id;
                const title = await request.title;
                updateChat(text + msg.data.message + ' EOS ', title, id);
            }
            return {message: msg.data.message};
        case 'title':
            const id = await request.id;
            const title = await request.title;
            const result = await updateTitle(title, id);
            return {message: result};
        case 'add':
            const uid = await request.id;
            const newTitle = await request.title;
            const newText = await request.text;
            const cid = await addChat(newText, newTitle, uid);
            return {cid: cid};
    }
    throw 'Invalid Method';
}

async function getAndCache(email: string) {
    let titles: string[] = [];
    let chats: string[] = [];
    let ids: string[] = [];
    try {
        const uid: string | null = await kv.hget('e:' + email, 'id');
        if (!uid) {
            throw 'Cache Miss';
        }
        ids = await kv.lrange('i:' + uid, 0, -1);
        for(let i = 0; i < ids.length; i++) {
            const msgs: string | null = await kv.hget('c:' + ids[i], 'msgs');
            if (msgs == null) {
                throw 'Cache Miss';
            }
            chats.push(msgs ?? '');
            const title: string | null = await kv.hget('c:' + ids[i], 'title');
            if (!title) {
                throw 'Cache Miss';
            }
            titles.push(title);
            if (i == ids.length - 1) {
                console.log('Cache Hit');
                return {uid: uid, titles: titles, chats: chats, ids: ids};
            }
        }
    } catch(e) {
        console.log('Cache Miss');
    }
    titles = [];
    chats = [];
    ids = [];
    const { rows } = await sql`SELECT Users.id AS uid, Chats.cid AS cid, Chats.title AS title, Chats.msgs AS msgs FROM Users LEFT JOIN Chats ON Users.id = Chats.uid WHERE Users.email = ${email} ORDER BY Chats.creation DESC;`;
    const uid = rows[0].uid;
    if (!uid) {
        throw 'Database Failed';
    }
    kv.hset('e:' + email, {id: uid});
    if (rows[0].uid) {
        rows.forEach((chat: any) => {
            if (!chat.cid) {
                return;
            }
            titles.push(chat.title);
            chats.push(chat.msgs ?? '');
            ids.push(chat.cid);
            kv.hset('c:' + chat.cid, {msgs: chat.msgs ?? '', title: chat.title});
            //kv.expire('c:' + chat.cid, parseInt(process.env.TTL ?? TTL.toString()));
        })
        kv.del('i:' + uid);
        kv.lpush('i:' + uid, ...ids);
        //kv.expire('i:' + uid, parseInt(process.env.TTL ?? TTL.toString()));
    }
    return {uid: uid, titles: titles, chats: chats, ids: ids};
}

export async function PUT(req: Request) {
    const request = await req.json();
    const res = await put(request);
    return NextResponse.json(res);
}

export async function POST(req: Request) {
    const request = await req.json();
    const email = await request.email;
    const res = await getAndCache(email);
    return NextResponse.json(res);
}

