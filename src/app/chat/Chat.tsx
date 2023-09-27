'use client';

import axios from 'axios';
import Chats from './chatClass';
import Title from './Title';
import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';

type chatTitle = {
    title: string,
    index: number
}

export default function Chat() {
    const { data, status } = useSession();
    const chat = useRef(new Chats());
    let id = '-1';

    const [textInput, setTextInput] = useState('');
    const [current, setCurrent] = useState(0);
    const [chatTitles, setChatTitles] = useState<chatTitle[]>([{title: 'New Chat', index: 0}])
    const [loadedChats, setLoadedChats] = useState(true);
    const [waiting, setWaiting] = useState(false)

    useEffect(() => {
        if (status == 'authenticated') {
            setLoadedChats(false);
            const res = axios.post('/chat/chats', {email: data.user?.email}).then((res) => {
                id = res.data.uid;
                chat.current.init(res.data.titles, res.data.chats, res.data.ids);
                setChatTitles(chat.current.getArray())
                setLoadedChats(true);
            })
        }
    }, [])

    

    async function handleMessage(e: any) {
        e.preventDefault();
        if (!textInput) {
            return;
        }
        const cur = current;
        const currentChat = chat.current.get(cur) + textInput + ' EOS ';
        chat.current.set(cur, currentChat + ' EOS ...');
        setTextInput('');
        try {
            setWaiting(true);
            const body = status == 'authenticated' ?
                {status: status, text: currentChat, id: chat.current.getId(cur), title: chat.current.getTitle(cur)} : 
                {status: status, text: currentChat}
            const res = await axios.put('/chat/chats', body) 
            const newMsg: string = res.data.message;
            chat.current.set(cur, currentChat + newMsg + ' EOS ');
            setWaiting(false);
        } catch(e) {
            return;
        }
    };
  
    return <>
        {Title(chat.current.getTitle(current))}
        <div className = "fixed top-1/6 left-0 w-2/12 h-full bg-slate-600">
            {status == 'authenticated' ? (loadedChats ? chatTitles.map((c) => {
                return <button className = "px-2 py-6 text-xl w-full text-start bg-slate-700 hover:bg-slate-500" key = {crypto.randomUUID()} onClick = {() => {setCurrent(c.index)}}>{c.title}</button>
            }) : <p className = "px-2 py-6 text-xl w-full text-start bg-slate-700 hover:bg-slate-500">Loading Chats...</p>)
             : <button className = "px-2 py-6 text-3xl w-full text-start bg-slate-700 hover:bg-slate-500" onClick = {() => {signIn()}}>Sign in to save and store multiple chats!</button>}
        </div>
        <div className = "flex flex-col items-center justify-items-end w-full overflow-y-scroll" style = {{height: '55vh'}}>
            {chat.current.get(current).split(' EOS ').map((text) => {
                if (text) {
                    return <div className = {'m-4 rounded-xl ' + (text == '...' && waiting ? 'bg-slate-400' : 'w-7/12 bg-slate-600')} key = {crypto.randomUUID()}>
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