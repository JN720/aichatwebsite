import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials'

import { sql } from '@vercel/postgres';

async function hash(inputString: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(inputString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    console.log(hashHex);
    return hashHex;
}

const handler = NextAuth({
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID ?? '',
            clientSecret: process.env.GITHUB_SECRET ?? ''
        }),
        CredentialsProvider({
            name: "Email",
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                    placeholder: "Enter email",
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "Enter Password",
                },
            },
            async authorize(credentials) {
                try {
                    const email = credentials?.email;
                    let password = credentials?.password;
                    if (password) {
                        password = await hash(password);
                    }
                    const { rows } = await sql`SELECT name, password FROM Users WHERE email = ${email} AND auth = 0;`;
                    if (rows[0].password != password) {
                        return null;
                    }
                    const user = {email: rows[0].email, name: rows[0].name, id: '1'}
                    return user;
                } catch(e) {
                    return null;
                }
            }
        })]
})

export {handler as GET, handler as POST};