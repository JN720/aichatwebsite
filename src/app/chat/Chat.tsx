'use client';

import axios from 'axios';
import Chats from './chatClass';
import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import spinner from './titleSpinner.png'

const titleButtonStyle = 'm-4 p-2 text-center text-2xl rounded-2xl ';

type chatTitle = {
    title: string,
    index: number
}

type chatMessage = {
    text: string,
    isLast: boolean
}

export default function Chat() {
    const { data, status } = useSession();
    const chat = useRef(new Chats());
    const id = useRef('-1');
    const displayMsgs = useRef<HTMLDivElement | null>(null);

    const [textInput, setTextInput] = useState('');
    const [current, setCurrent] = useState(0);
    const [chatTitles, setChatTitles] = useState<chatTitle[]>([{title: 'New Chat', index: 0}]);
    const [loadedChats, setLoadedChats] = useState(0);
    const [waiting, setWaiting] = useState(false);
    const [newTitle, setNewTitle] = useState(chat.current.getTitle(current));
    const [renaming, setRenaming] = useState(false);
    const [ephemeral, setEphemeral] = useState(true);
    const [titleLoading, setTitleLoading] = useState(false);
    const [msgErr, setMsgErr] = useState([false]);
    const preErr = useRef(['']);

    async function getChats() {
        if (status == 'authenticated') {
            setLoadedChats(0);
            const res = axios.post('/chat/chats', {email: data.user?.email}).then((res: any) => {
                id.current = res.data.uid;
                chat.current = new Chats();
                if (!id) {
                    throw 'ID Fetch Failed';
                }
                const { errs, pres } = chat.current.init(res.data.titles ?? [], res.data.chats ?? [], res.data.ids ?? []);
                setMsgErr(errs);
                preErr.current = pres;
                setChatTitles(chat.current.getArray());
                setLoadedChats(1);
            }).catch(() => {
                setLoadedChats(2);
            })
        } else {
            setLoadedChats(1);
        }
    }

    useEffect(() => {
        getChats();
    }, [])

    async function handleChange(index: number) {
        setNewTitle(chat.current.getTitle(index));
        setCurrent(index);
    }

    async function handleAdd(e: any, title: string, msgs: string) {
        if (!ephemeral) return;
        setTitleLoading(true);
        setRenaming(false);
        const body = {type: 'add', status: status, id: id.current, title: title, text: msgs};
        try {
            const res = await axios.put('/chat/chats', body);
            if (res.data.message == 'error') {
                throw 'Update Failed';
            }
            chat.current.setTitle(0, title);
            setChatTitles(chat.current.getArray())
        } catch(e) {
            //error handling goes here
            console.log('o no handleAdd');
        }
        setEphemeral(false);
        setTitleLoading(false);
    }

    async function handleNew() {
        const newChat = new Chats();
        newChat.init(chat.current.getTitles(), chat.current.getAll(), chat.current.getIds());
        chat.current = newChat;
        setChatTitles(chat.current.getArray());
        setEphemeral(true)
        handleChange(0)
    }

    async function handleTitle(e: any, cur: number, title: string) {
        if (!title) return;
        setTitleLoading(true);
        setRenaming(false);
        const body = {type: 'title', status: status, id: chat.current.getId(cur), title: title};
        try {
            const res = await axios.put('/chat/chats', body);
            if (res.data.message == 'error') {
                throw 'Update Failed';
            }
            chat.current.setTitle(cur, title);
            setChatTitles(chat.current.getArray())
        } catch(e) {
            //error handling goes here
            console.log('o no handleTitle')
        }
        setTitleLoading(false);

    }

    async function handleMessage(cur: number, text: string) {
        if (!text || waiting) {
            return;
        }
        const err = msgErr[cur];
        const currentChat = err ? chat.current.getString(cur).substring(0, chat.current.getString(cur).length - 8) : chat.current.getString(cur) + (err ? '' : text + ' EOS ');
        preErr.current[cur] = text;
        chat.current.set(cur, currentChat + ' EOS ...');
        setTextInput('');
        const newMsgErr = [...msgErr];
        newMsgErr[cur] = false;
        setMsgErr(newMsgErr);
        try {
            setWaiting(true);
            const body = status == 'authenticated' && (current || !ephemeral) ?
                {type: 'msg', status: status, text: currentChat, id: chat.current.getId(cur), title: chat.current.getTitle(cur)} : 
                {type: 'msg', status: 'unauthenticated', text: currentChat}
            const res = await axios.put('/chat/chats', body);
            const newMsg: string = res.data.message;
            if (!newMsg) {
                throw 'Message Failed';
            }
            chat.current.set(cur, currentChat + newMsg + ' EOS ');
            
            setWaiting(false);
        } catch(e) {
            const newMsgErr = [...msgErr];
            newMsgErr[cur] = true;
            setMsgErr(newMsgErr);
            setWaiting(false);
        }
        if (displayMsgs.current) {
            displayMsgs.current.scrollTop = displayMsgs.current?.scrollHeight;
        }
    };
  
    return <>
        <div className = "flex bg-slate-700 w-5/6 float-right">
            {renaming ? <>
                <input className = "m-4 p-2 text-start text-3xl rounded-3xl bg-slate-800" defaultValue = {chat.current.getTitle(current)} onChange = {(e) => {setNewTitle(e.target.value)}}/>
                {ephemeral && !current ?
                    <button className = {titleButtonStyle + 'bg-fuchsia-700 hover:bg-fuchsia-500'} onClick = {(e) => {handleAdd(e, newTitle, chat.current.getString(current))}}>Add</button> :
                    <button className = {titleButtonStyle + (newTitle ? 'bg-blue-700 hover:bg-blue-500' : 'bg-slate-600')} onClick = {(e) => {handleTitle(e, current, newTitle)}}>Save</button>
                }
                <button className = {titleButtonStyle + 'bg-red-500 hover:bg-red-300'} onClick = {() => {setRenaming(false)}}>Cancel</button>
            </> : <>
                <h1 className = "m-4 p-2 text-start text-3xl">{chatTitles[current].title}</h1>
                {status == 'authenticated' && loadedChats == 1 ? <button className = {titleButtonStyle + "bg-orange-400 hover:bg-orange-200"} onClick = {() => setRenaming(true)}>{ephemeral && !current ? 'Name and Add' : 'Rename'}</button> : null}
            </>
            }
            {titleLoading ? <Image src = {spinner} className = "m-4 ms-0 p-2 animate-spin h-14 w-14" alt = "."/> : null}
        </div>
        <div className = "fixed top-1/6 left-0 w-2/12 h-full bg-slate-600">
            {status == 'authenticated' && !ephemeral ? <button className = "px-2 py-7 text-xl w-full text-start text-green-400 bg-slate-700 hover:bg-slate-500" onClick = {() => {handleNew()}}>Add New Chat</button> : null}
            {status == 'authenticated' ? (loadedChats ? chatTitles.map((c) => {
                return <button className = "px-2 py-7 text-xl w-full text-start bg-slate-700 hover:bg-slate-500" key = {crypto.randomUUID()} onClick = {() => {handleChange(c.index)}}>{c.title}</button>
            }) : <p className = "px-2 py-7 text-xl w-full text-start bg-slate-700 hover:bg-slate-500">Loading Chats...</p>)
             : <button className = "px-2 py-6 text-3xl w-full text-start bg-slate-700 hover:bg-slate-500" onClick = {() => {signIn()}}>Sign in to save and store multiple chats!</button>}
            {loadedChats == 2 ? <button className = "px-2 py-6 text-3xl w-full text-start text-red-500 bg-slate-700 hover:bg-slate-500" onClick = {() => {getChats()}}>Failed to load chats, click to retry</button> : null}
        </div>
        <div className = "flex flex-col items-center justify-items-end w-full overflow-y-scroll" style = {{height: '65vh'}}>
            {chat.current.get(current).map((msg: chatMessage) => {
                if (msg.text || msgErr[current] || waiting) {
                    return msg.isLast && msgErr[current] ? <button className = "m-4 p-4 rounded-xl text-xl bg-red-600 hover:bg-red-400" onClick = {() => handleMessage(current, preErr.current[current])} key = {crypto.randomUUID()}>Error, Click to Retry</button> :
                        <div ref = {displayMsgs} className = {'m-4 rounded-xl ' + (msg.isLast && waiting ? 'bg-slate-400' : 'w-7/12 bg-slate-600')} key = {crypto.randomUUID()}>
                            <p className = "p-4 text-xl">{msg.isLast && waiting ? '...' : msg.text}</p>
                        </div>
                }
            })}
        </div>
        <div className = "flex flex-col items-center justify-end">
            <div className = "w-full h-full flex flex-none place-items-center justify-center">
                <textarea className = "m-3 p-1 text-left text-2xl w-1/3 rounded-md bg-blue-950 resize-none" rows = {4} placeholder = "Enter text" value = {textInput} onChange = {(e) => {setTextInput(e.target.value)}}/>
                <button className = "m-3 p-3 text-center text-3xl w-1/12 h-1/3 rounded-md bg-lime-800 hover:bg-lime-500" onClick = {(e) => handleMessage(current, textInput)}>Send</button>
            </div>    
        </div>
    </>
  }