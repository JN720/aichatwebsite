import Link from 'next/link'

export default function Created() {
    return <div className = "flex flex-col items-center justify-center w-full min-h-screen">
        <p className = "py-6 text-4xl text-center">Your account has been created!</p>
        <Link className = "text-4xl text-center text-blue-600 hover:text-blue-400" href = "/api/auth/signin"> Click to go to Sign In</Link>
    </div>
}