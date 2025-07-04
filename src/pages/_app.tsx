import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { CartProvider } from '../contexts/CartContext'
import Layout from '../components/Layout'
import { useState } from 'react'

interface CustomPageProps {
  searchQuery?: string
}

export default function App({
  Component,
  pageProps
}: AppProps<CustomPageProps>) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <CartProvider>
      <Layout onSearch={handleSearch}>
        <Component {...pageProps} searchQuery={searchQuery} />
      </Layout>
    </CartProvider>
  )
}