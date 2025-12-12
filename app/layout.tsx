'use client'

import { useEffect } from 'react'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Register service worker for PWA
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Only register in production (when built)
      navigator.serviceWorker.register('/service-worker.js').catch(() => {
        // Service worker registration failed (probably in dev mode)
      })
    }
  }, [])

  return (
    <html lang="cs">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF4081" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <title>Fairworkers - Práce na míru. Bez čekání.</title>
        <meta name="description" content="Zaregistruj se, pracuj, dostaň peníze. 85% vydělávajících." />
      </head>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  )
}