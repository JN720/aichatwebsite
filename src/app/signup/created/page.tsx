import Link from 'next/link'

export default function Created() {
    return <div className = "w-full h-full">
        <h1 className = "">Your account has been created</h1>
        <Link className = "m-2 p-2 text-s text-blue-600 hover:text-blue-400" href = "/api/auth/signin"></Link>
    </div>
}