import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(req: any) {
    console.log(req.body)
    const { email, name, password} = req.body;
    return NextResponse.json({status: signup(email, name, password)});
}

async function signup(email: string, name: string, hash: string) {
    const { rows } = await sql`SELECT email FROM Users WHERE email = ${email} AND auth = 0`;
    try {
        if (rows) {
            return 400;
        }
    } catch(e) {
        try {
            await sql`INSERT INTO Users(email, name, password, auth) VALUES(${email}, ${name}, ${hash}, 0)`;
            return 200;
        } catch{
            return 500;
        }
            
    }
}