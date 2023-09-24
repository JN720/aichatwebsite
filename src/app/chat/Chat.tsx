'use client';

import Chats from './chatClass';
import Title from './Title';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Chat() {
    const { data, status } = useSession();
    let chatInfo: Chats;
    useEffect(() => {
        if (status == 'authenticated') {
            fetch('/chat/chats', {method: 'POST',headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ 
                a: 'e'
            })}).then((res: Response) => res.json()).then((res) => {
                chatInfo = res;
            });
        } else {
            chatInfo = new Chats();
        }
    }, [])

    const [textInput, setTextInput] = useState('');
    const [textStream, setTextStream] = useState('something text EOS more text ');
    const [title, setTitle] = useState('New Chat');
    const [chats, setChats] = useState([]);
  
    const handleButtonClick = () => {
        if (!textInput) return;
        fetch('', {
            method: 'POST',headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ 
                instruction: 'Instruction: Respond intelligently.', 
                knowledge: 'Knowledge: You are helpful.',
                dialog: textStream + textInput
            })
        }).then((response) => response.json()).then((data: any) => {
            setTextStream(textStream + data.message + ' EOS ');
        }).catch((error) => {
            console.error('Error:', error);
        });
    };
  
    return <>
        {Title(title)}
        <div className = "fixed top-1/6 left-0 w-2/12 h-full bg-slate-600">
            {chats.map((chat: string) => {
                return <button className = "px-2 py-6 text-xl w-full text-start bg-slate-700 hover:bg-slate-500" key = {crypto.randomUUID()} onClick = {(e) => {setTitle(chat)}}>{chat}</button>
            })}
        </div>
        <div className = "flex flex-col items-center justify-start overflow-y-scroll" style = {{height: '65vh'}}>
            {textStream.split(' EOS ').map((text) => {
                return <div className = "m-4 w-7/12 rounded-xl bg-slate-600" key = {crypto.randomUUID()}>
                    <p className = "p-4 text-xl">{text}</p>
                </div>
            })}
        </div>
        <div className = "flex flex-col items-center justify-end">
            <textarea className = "m-3 p-1 text-left text-2xl w-1/3 h-40 rounded-md bg-blue-800 resize-none" rows = {3} placeholder = "Enter text" value = {textInput} onChange = {(e) => {setTextInput(e.target.value)}}/>
            <button className = "m-1 p-3 text-center text-3xl w-48 rounded-md bg-lime-800 hover:bg-lime-500" onClick = {(handleButtonClick)}>Send</button>
        </div>
    </>
  }