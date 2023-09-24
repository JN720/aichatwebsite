import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(req: any) {
    return req.json().then((request: any) => {
        const {email, name, password} = request;
        return signup(email, name, password);
    }).then((result: Response) => {
        return NextResponse.json({status: result});
    })
}

async function signup(email: string, name: string, hash: string) {
    const { rows } = await sql`SELECT email FROM Users WHERE email = ${email} AND auth = 0`;
    try {
        if (rows[0].email == email) {
            return 400;
        }
    } catch(e) {
        sql`INSERT INTO Users(email, name, password, auth) VALUES(${email}, ${name}, ${hash}, 0)`.then(() => {
            return 200;
        }).catch(() => {
            return 500;
        }); 
    }
}