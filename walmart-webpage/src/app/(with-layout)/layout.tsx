import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function WithLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}