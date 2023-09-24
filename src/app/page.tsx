import Link from "next/link"

export default function Home() {
    return <>
        <main className = "flex flex-col p-24 w-screen h-screen items-center justify-center">
            <h1 className = "p-6 text-center text-5xl">Welcome to the Jsan Website</h1>
            <h2 className = "p-6 text-center text-3xl text-slate-300">Named in Honor of Jsan</h2>
            <Link className = "mt-3 p-6 text-center rounded-2xl text-4xl bg-blue-600 hover:bg-blue-400" href = "/chat">Try it Out</Link>
        </main>
    </>
}