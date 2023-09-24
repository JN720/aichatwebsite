import Chat from './Chat';
import Nav from './Nav';

export default function Home() {
    return <div className = "min-h-screen w-screen">
        <Nav/>
        <main className = "">
            <Chat/>
        </main>
    </div>
}
