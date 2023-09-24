'use client';

import { useState } from 'react';
import Link from 'next/link';

async function hash(inputString: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(inputString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    console.log(hashHex);
    return hashHex;
}

function Submit(email: string, name: string, password: string, confPass: string) {
    if (!email || !name || !password || !confPass) {
        return <button className = "p-4 mt-3 text-2xl rounded-xl align-middle text-gray-400 bg-gray-700" value = "Disabled">Sign Up</button>;
    }
    const errorStyle = 'p-4 mt-3 rounded-xl text-2xl bg-red-600'
    const emailre = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const namere = /^[a-zA-Z0-9_]+$/
    if (!emailre.test(email.toLowerCase())) {
        return <p className = {errorStyle}>Invalid Email</p>
    }
    if (!namere.test(name) || name.length < 3) {
        return <p className = {errorStyle}>Invalid Username: Must only contain alphanumeric characters and underscores and be at least 3 characters long</p>
    }
    if (password.length < 4) {
        return <p className = {errorStyle}>Passwords must be at least 4 characters long</p>
    }
    if (password != confPass) {
        return <p className = {errorStyle}>Passwords Unmatched</p>
    }
    return <button className = "p-4 mt-3 text-2xl rounded-xl align-middle bg-blue-900 hover:bg-blue-700" onClick = {() => {Result(email, name, hash(password))}}>Sign Up</button>
}

async function Result(email: string, name: string, password: Promise<string>) {
    fetch('/signup/create', {
        method: 'POST', headers: {'Content-Type': 'application-json'}, 
        body: JSON.stringify({email: email, name: name, password: await password})
    }).then((res) => {
        if(res.ok) {
            window.location.replace('/signup/created');
        }
    });
    
}

export default function Signup() {
    const labelFormat = 'p-3 text-xl';
    const fieldFormat = 'm-2 mt-0 p-1 bg-slate-800';
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confPass, setConfPass] = useState('');
    return <div className = "flex flex-col p-24 w-screen h-screen items-center justify-center bg-slate-900">
        <h1 className = "p-6 text-4xl">Create Account</h1>
        <label htmlFor = "email" className = {labelFormat}>Email</label>
        <input id = "email" className = {fieldFormat} type = "text" value = {email} onChange = {(e) => {setEmail(e.target.value)}}/>
        <label htmlFor = "name" className = {labelFormat}>Username</label>
        <input id = "name" className = {fieldFormat} type = "text" value = {name} onChange = {(e) => {setName(e.target.value)}}/>
        <label htmlFor = "password" className = {labelFormat}>Password</label>
        <input id = "password" className = {fieldFormat} type = "password" value = {password} onChange = {(e) => {setPassword(e.target.value)}}/>
        <label htmlFor = "confpass" className = {labelFormat}>Confirm Password</label>
        <input id = "confpass" className = {fieldFormat} type = "password" value = {confPass} onChange = {(e) => {setConfPass(e.target.value)}}/>
        {Submit(email, name, password, confPass)}
        <Link className = "m-2 p-2 text-s text-blue-500 hover:text-blue-300" href = "/api/auth/signin">If you want to sign up using a provider such as GitHub, <b>Sign In</b> instead</Link>
    </div>
}