'use client';

import axios from 'axios';
import Chats from './chatClass';
import Title from './Title';
import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Chat() {
    const { data, status } = useSession();
    let chatInfo = new Chats();

    useEffect(() => {
        if (status == 'authenticated') {
            fetch('/chat/chats', {method: 'GET', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ 
                email: data.user?.email
            })}).then((res: Response) => res.json()).then((res) => {
                chatInfo = res;
            });
        }
    }, [])

    const [textInput, setTextInput] = useState('');
    const [textStream, setTextStream] = useState('');
    const [title, setTitle] = useState('New Chat');
    const [chatNames, setChatNames] = useState([]);

    async function handleMessage(e: any) {
        e.preventDefault();
        if (!textInput) {
            return;
        }
        const chat = textStream + textInput + ' EOS ';
        setTextStream(chat + ' EOS ...');
        setTextInput('');
        const res = await axios.post('/chat/chats', {status: status, text: textStream + textInput + ' EOS '})
        const newMsg: string = res.data.message;
        setTextStream(chat + newMsg + ' EOS ');
    };
  
    return <>
        {Title(title)}
        <div className = "fixed top-1/6 left-0 w-2/12 h-full bg-slate-600">
            {status == 'authenticated' ? chatNames.map((chat: string) => {
                return <button className = "px-2 py-6 text-xl w-full text-start bg-slate-700 hover:bg-slate-500" key = {crypto.randomUUID()} onClick = {(e) => {setTitle(chat)}}>{chat}</button>
            }) : <button className = "px-2 py-6 text-3xl w-full text-start bg-slate-700 hover:bg-slate-500" onClick = {() => {signIn()}}>Sign in to save and store multiple chats!</button>}
        </div>
        <div className = "flex flex-col items-center justify-items-end w-full overflow-y-scroll" style = {{height: '55vh'}}>
            {textStream.split(' EOS ').map((text) => {
                if (text) {
                    return <div className = "m-4 w-7/12 rounded-xl bg-slate-600" key = {crypto.randomUUID()}>
                        <p className = "p-4 text-xl">{text}</p>
                    </div>
                }
            })}
        </div>
        <div className = "flex flex-col items-center justify-end">
            <textarea className = "m-3 p-1 text-left text-2xl w-1/3 h-40 rounded-md bg-blue-950 resize-none" rows = {3} placeholder = "Enter text" value = {textInput} onChange = {(e) => {setTextInput(e.target.value)}}/>
            <button className = "m-1 p-3 text-center text-3xl w-48 rounded-md bg-lime-800 hover:bg-lime-500" onClick = {(e) => handleMessage(e)}>Send</button>
        </div>
    </>
  }