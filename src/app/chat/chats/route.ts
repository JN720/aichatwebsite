import axios from 'axios';
import { kv } from "@vercel/kv";
import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";

//const client = db.connect();

export async function POST(req: Request) {
    const request = await req.json();
    const text = await request.text;
    const form = new FormData();
    form.append('instruction', 'Instruction: Respond intelligently.');
    form.append('knowledge', 'Knowledge: You are helpful.');
    form.append('dialog', text);
    const msg = await axios.post(process.env.GEN_URL ?? 'http://localhost:8000', form)
    console.log(msg.data.message)
    return NextResponse.json({message: msg.data.message});
}

export async function GET() {

}