import Link from 'next/link';

export default function Nav() {
    return <nav className = "flex w-full">
        <Link className = "bg-slate-800 p-12 text-lg align-middle" href = "">I am a link</Link>
        <Link className = "bg-slate-800 p-12 text-lg align-middle" href = "">and I am too</Link>
    </nav>
}