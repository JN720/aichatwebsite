import Chat from './Chat';
import Title from './Title';
import Nav from './Nav';

export default function Home() {
  return <>
    <Nav/>
    <main className = "h-fit">
      <div className = "px-24">
        <Title/>
        <Chat/>
      </div>
    </main>
  </>
}
