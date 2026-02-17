import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FitLink — Your Measurement Vault',
  description: 'Store your body measurements once. Share with any tailor instantly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        <Suspense fallback={
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-slate-500 text-sm">Loading...</div>
          </div>
        }>
          {children}
        </Suspense>
      </body>
    </html>
  )
}
