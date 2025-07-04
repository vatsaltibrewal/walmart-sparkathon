import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Head from 'next/head'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  onSearch: (query: string) => void
}

export default function Layout({
  children,
  title = 'Walmart Clone - Save Money. Live Better.',
  description = 'Shop online for electronics, home, groceries, and more at Walmart Clone.',
  onSearch
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Navbar onSearch={onSearch} />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}