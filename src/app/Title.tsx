"use client";

import { useState } from 'react';

export default function Title() {
    const [title, setTitle] = useState('New Chat');
    return <div className = "bg-slate-700">
        <h1 className = "text-center text-5xl p-12">{title}</h1>
    </div>
}