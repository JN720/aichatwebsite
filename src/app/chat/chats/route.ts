import axios from 'axios';
import { kv } from "@vercel/kv";
import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";

let client: any;

db.on('connect', () => {
    console.log(':D');
})

db.on('error', () => {
    console.log('D;');
})

async function connectClient() {
    client = await db.connect();
}

async function updateChat(msg: string, title: string, id: number) {

}

export async function PUT(req: Request) {
    const request = await req.json();
    const status = await request.status;
    const text = await request.text;
    const form = new FormData();
    form.append('instruction', 'Instruction: Respond intelligently.');
    form.append('knowledge', 'Knowledge: You are helpful.');
    form.append('dialog', text);
    const msg = await axios.post(process.env.GEN_URL ?? 'http://localhost:8000', form)
    if (status == 'authenticated') {
        updateChat(text + msg.data.message + ' EOS ', request.title, request.id)
    }
    return NextResponse.json({message: msg.data.message});
}

export async function POST(req: Request) {
    const request = await req.json();
    const email = await request.email;
    let titles: string[] = [];
    let chats: string[] = []
    try {
        const { rows } = await client.sql`SELECT Users.id AS uid, Chats.cid AS cid, Chats.title AS title, Chats.msgs AS msgs FROM Users JOIN Chats ON Users.id = Chats.uid WHERE Users.email = ${email} ORDER BY Chats.creation;`;
        rows.forEach((chat: any) => {
            titles.push(chat.title);
            chats.push(chat.msgs);
        })
        return NextResponse.json({uid: rows[0].uid, titles: titles, chats: chats});
    } catch(e) {
        await connectClient();
        const { rows } = await client.sql`SELECT Users.id AS uid, Chats.cid AS cid, Chats.title AS title, Chats.msgs AS msgs FROM Users JOIN Chats ON Users.id = Chats.uid WHERE Users.email = ${email} ORDER BY Chats.creation;`;
        rows.forEach((chat: any) => {
            titles.push(chat.title);
            chats.push(chat.msgs);
        })
        return NextResponse.json({uid: rows[0].uid, titles: titles, chats: chats});
    }
}