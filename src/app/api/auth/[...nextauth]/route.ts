import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials'

import { sql } from '@vercel/postgres';
import { kv } from '@vercel/kv';

async function hash(inputString: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(inputString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
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
                    const namePass = await kv.hget('e:' + email, 'name').then(async(name) => {
                        const pass = await kv.hget('e:' + email, 'password');
                        if (!name || !pass) {
                            throw 'Cache Miss';
                        }
                        return [name, pass];
                    }).catch(async() => {
                        const { rows } = await sql`SELECT id, name, password FROM Users WHERE email = ${email} AND auth = 0;`;
                        kv.hset('e:' + email, {id: rows[0].id, name: rows[0].name, password: rows[0].password});
                        return [rows[0].name, rows[0].password];
                    })
                    if (namePass[1] != password) {
                        return null;
                    }
                    const user = {email: email, name: namePass[0], id: '1'}
                    return user;
                } catch(e) {
                    return null;
                }
            }
        })],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                let authMethod = -1;
                try {
                    switch(account?.provider) {
                        case 'credentials':
                            return token;
                        case 'github':
                            authMethod = 1;
                            const id = await checkUser(token.email, token.name, authMethod).catch(() => {throw 'No Info'});
                            if (id) {
                                return token;
                            }
                    }
                } catch(e) {
                    if (authMethod == -1) {
                        return token;
                    }
                    await sql`INSERT INTO Users(email, name, auth) VALUES(${token.email}, ${token.name}, ${authMethod});`;
                    kv.hset('e:' + token.email, {email: token.email, name: token.name, auth: authMethod});
                    return token;
                }
            }
            return token;
        }
    }
})

async function checkUser(email: string | null | undefined, name: string | null | undefined, authMethod: number) {
    if (!email) {
        throw 'No Info';
    }
    try {
        const id = await kv.hget('e:' + email, 'id');
        if (!id) {
         throw 'Cache Miss';
        }
        return id;
    } catch(e) {
        const { rows } = await sql`SELECT id FROM Users WHERE email = ${email} AND auth = ${authMethod};`;
        if (rows[0].id) {
            kv.hset('e:' + email, {id: rows[0].id, email: email, name: name, auth: authMethod});
        } else {
            throw 'Database Down';
        }
        return rows[0].id;
    }
}

export {handler as GET, handler as POST};