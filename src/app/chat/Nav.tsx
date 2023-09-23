'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react'

function Account() {
    const {data: session} = useSession();
    if (session) {
        return <>
            <a className = "p-4 text-2xl align-middle text-lime-500">Logged in as {session?.user?.name}</a>
            <button className = "m-2 p-2 text-2xl rounded-xl align-middle bg-blue-900 hover:bg-blue-700" onClick = {() => signOut()}>Sign Out</button>
        </>
    } else {
        return <>
            <button className = "m-2 p-2 text-2xl rounded-xl align-middle bg-blue-900 hover:bg-blue-700" onClick = {() => signIn()}>Sign In</button>
            <Link className = "m-2 p-2 text-2xl rounded-xl align-middle bg-blue-900 hover:bg-blue-700" href = "/signup">Create an Account</Link>
        </>
    }
}
export default function Nav() {
    return <nav className = "bg-slate-800 px-12 py-3">
        <Link className = "p-4 text-2xl align-middle" href = "">I am a link</Link>
        <Link className = "p-4 text-2xl align-middle" href = "">and I am too</Link>
        <Account/>

    </nav>
}