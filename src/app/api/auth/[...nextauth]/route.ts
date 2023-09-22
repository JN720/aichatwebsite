import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials'

import { sql } from '@vercel/postgres';

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
                    const password = credentials?.password;
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