import { sql } from '@vercel/postgres';

export default async function handler(req: Request, res: any) {
    try {
        if (req.method !== 'POST') {
            res.status(405).send({ message: 'Only POST requests allowed' })
            return
        }
        const body = JSON.parse(JSON.stringify(req.body))
        const { rows } = await sql`SELECT password FROM Users WHERE email = ${body.email} AND auth = 0 AND password = ${body.password};`;
        if (!rows) {
            res.status(404).send({ message: 'User does not exist!' })
            return
        }
        const user = {email: rows[0].email, name: rows[0].name, id: rows[0].id};
        res.status(200).json(user);
    } catch (error) {
        res.status(405).send({ message: `{error.message}` })
        return
    }
};