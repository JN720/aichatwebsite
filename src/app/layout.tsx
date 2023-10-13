import './globals.css'
import type { Metadata } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import { getServerSession } from 'next-auth';
import SessionProvider from './SessionProvider';

const font = IBM_Plex_Sans({ subsets: ['latin'] , display: 'swap', weight: ['100', '200', '300', '400', '500', '600', '700']})

export const metadata: Metadata = {
  title: 'Jsan AI Chat',
  description: 'An effort from one professional idiot to another.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body className={font.className}>
        <SessionProvider session = {session}>
          {children}
        </SessionProvider>
      </body>

    </html>
  )
}
