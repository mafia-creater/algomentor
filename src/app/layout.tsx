import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AlgoMentor - Master the Art of Problem Solving',
  description: 'An AI-powered interview preparation platform that guides you through a proven 6-phase workflow to build deep problem-solving intuition.',
  keywords: ['coding interview', 'technical interview', 'problem solving', 'data structures', 'algorithms', 'AI mentor', 'LeetCode prep', 'software engineering'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Navbar /> {/* Add the Navbar here */}
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}
