'use client';

import { useState } from 'react';

export default function Chat() {
    const [textInput, setTextInput] = useState('');
    const [textStream, setTextStream] = useState('');
    const apiUrl = 'http://localhost:8000'; // Replace with your API endpoint URL
  
    const handleButtonClick = () => {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
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
  
    return (
        <div className = "container items-center">
            <input className = "m-3 p-1 text-left align-bottom rounded-md bg-blue-800" type = "text" placeholder = "Enter text" value = {textInput} onChange = {(e) => {setTextInput(e.target.value)}}/>
            <button className = "m-3 p-1 text-center align-bottom rounded-md bg-lime-800 hover:bg-lime-500" onClick = {(handleButtonClick)}>Send</button>
        </div>
    )
  }