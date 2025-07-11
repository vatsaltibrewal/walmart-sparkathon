import React from 'react'
import Hero from '../components/Hero'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface HomePageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams
  const searchQuery = resolvedSearchParams.search || ''
  
  return (
    <>
      <Navbar />
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      </div>
      <Footer />
    </>
  )
}