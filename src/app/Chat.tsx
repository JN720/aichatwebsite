'use client';

import { useState } from 'react';

export default function Chat() {
    const [textInput, setTextInput] = useState('');
    const [textStream, setTextStream] = useState('');
    const apiUrl = 'http://localhost:8000'; // Replace with your API endpoint URL
  
    const handleTextChange = (event: any) => {
      setTextInput(event.target.value);
    };
  
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
      <div className = "container align-bottom">
        <input className = "text-left" type = "text" placeholder = "Enter text" value = {textInput} onChange = {handleTextChange}/>
        <button className = "text-center" onClick = {handleButtonClick}>Send</button>
      </div>

    );
  }