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
                    const user = {email: email, name: rows[0].name, id: '1'}
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
                            const { rows } = await sql`SELECT id FROM Users WHERE email = ${token.email} AND name = ${token.name} AND auth = 1`;
                            if (rows[0].email == token.email) {
                                return token;
                            }
                    }
                } catch(e) {
                    if (authMethod == -1) {
                        return token;
                    }
                    await sql`INSERT INTO Users(email, name, auth) VALUES(${token.email}, ${token.name}, ${authMethod})`;
                    return token;
                }
            }
            return token;
        }
    }
})

export {handler as GET, handler as POST};