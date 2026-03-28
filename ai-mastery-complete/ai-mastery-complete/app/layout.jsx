import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Mastery | Learn AI, Make Money, Stay Ahead',
  description: 'Join 10,000+ members learning to leverage AI for income.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
     <script src="https://checkout.razorpay.com/v1/checkout.js"></script> </head>
      <body className="bg-dark text-white dark">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
