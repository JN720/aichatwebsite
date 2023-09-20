import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials'

export const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? ''
    }),
    CredentialsProvider({
      name: "Credentials",
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
      async authorize(credentials, req) {
        const email = credentials?.email;
        const password = credentials?.password;
        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({email, password}),
        });
        const user = await res.json();
        if (res.ok && user) {
            return user;
        } else return null;
      }
    }
    )],
  callbacks: {
    async jwt({ token, user }) {
        return { ...token, ...user };
    },
    async session({ session, token, user }) {
        // Send properties to the client, like an access_token from a provider.
        session.user = token;
        return session;
    }},
  pages: {
    signIn: '/auth/signin',
  }
})

export {handler as GET, handler as POST};