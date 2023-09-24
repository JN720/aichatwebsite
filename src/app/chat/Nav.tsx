'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react'

const linkStyle = "m-2 p-2 text-2xl rounded-xl align-middle hover:text-blue-400 ";

function Account() {
    const {data: session} = useSession();
    if (session) {
        return <>
            <a className = "m-2 p-2 text-2xl float-right align-middle text-lime-500">Logged in as <b className = "text-lime-400">{session?.user?.name}</b></a>
            <button className = {linkStyle + 'float-right'} onClick = {() => signOut()}>Sign Out</button>
        </>
    } else {
        return <>
            <button className = {linkStyle} onClick = {() => signIn()}>Sign In</button>
            <Link className = {linkStyle} href = "/signup">Create an Account</Link>
        </>
    }
}

export default function Nav() {
    return <nav className = "h-16 w-screen bg-slate-800">
        <Link className = {linkStyle + 'float-left'} href = "">I am a link</Link>
        <Link className = {linkStyle + 'float-left'} href = "">and I am too</Link>
        <Account/>
    </nav>
}