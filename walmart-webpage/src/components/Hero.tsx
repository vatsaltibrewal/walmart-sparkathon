'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const mainDeals = [
  {
    id: 1,
    title: "Don't miss up to 30% off!",
    subtitle: "JULY 8-13 ONLY!",
    description: "Tech deals, home essentials & more",
    buttonText: "Shop Deals",
    buttonLink: "/deals",
    backgroundImage: "/images/deals-banner-1.jpg",
    backgroundColor: "bg-blue-400"
  },
  {
    id: 2,
    title: "Smart savings on Apple",
    subtitle: "Limited time offer",
    description: "MacBooks, iPads & more",
    buttonText: "Shop Deals",
    buttonLink: "/deals",
    backgroundImage: "/images/apple-deals.jpg",
    backgroundColor: "bg-blue-300"
  },
  {
    id: 3,
    title: "Up to 25% off baby",
    subtitle: "Everything for little ones",
    description: "Car seats, strollers & essentials",
    buttonText: "Shop Deals", 
    buttonLink: "/deals",
    backgroundImage: "/images/baby-deals.jpg",
    backgroundColor: "bg-blue-300"
  }
]

const sideDeals = [
  {
    title: "Up to 50% off school supplies",
    buttonText: "Shop deals",
    image: "/images/school-supplies.jpg",
    link: "/deals",
    backgroundColor: "bg-blue-200"
  },
  {
    title: "Up to 40% off cook & dine", 
    buttonText: "Shop deals",
    image: "/images/kitchen-deals.jpg",
    link: "/deals",
    backgroundColor: "bg-blue-200"
  },
  {
    title: "Up to 50% off",
    buttonText: "Shop now",
    image: "/images/toys-deals.jpg", 
    link: "/deals",
    backgroundColor: "bg-yellow-200"
  }
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mainDeals.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mainDeals.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mainDeals.length) % mainDeals.length)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="bg-gray-50 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Deals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          {/* Main Carousel - Takes 2.5 columns on desktop */}
          <div className="lg:col-span-3 relative">
            <div className="relative h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden">
              {mainDeals.map((deal, index) => (
                <div
                  key={deal.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className={`${deal.backgroundColor} h-full flex items-center justify-between p-6 lg:p-8`}>
                    <div className="flex-1 text-white max-w-md">
                      <div className="bg-blue-900 text-white px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">
                        Walmart DEALS
                      </div>
                      <div className="bg-blue-800 text-walmart-yellow px-3 py-1 rounded text-sm font-bold mb-2 inline-block">
                        {deal.subtitle}
                      </div>
                      <h2 className="text-2xl lg:text-4xl font-bold text-black mb-2">
                        {deal.title}
                      </h2>
                      <p className="text-black mb-4 text-sm lg:text-base">
                        {deal.description}
                      </p>
                      <Link 
                        href={deal.buttonLink}
                        className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-block"
                      >
                        {deal.buttonText}
                      </Link>
                    </div>
                    <div className="hidden sm:block flex-1 max-w-sm">
                      <Image
                        src="/images/deals-products.png"
                        alt="Deal products"
                        width={300}
                        height={200}
                        className="w-full h-auto"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-700" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="absolute bottom-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            >
              {isPlaying ? (
                <svg className="h-4 w-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1zM13 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {mainDeals.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Side Deals - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            {sideDeals.map((deal, index) => (
              <Link href={deal.link} key={index}>
                <div className={`${deal.backgroundColor} rounded-lg p-4 h-32 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer`}>
                  <h3 className="text-sm font-semibold text-gray-800 leading-tight">
                    {deal.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600 font-medium hover:underline">
                      {deal.buttonText}
                    </span>
                    <div className="w-12 h-8">
                      <Image
                        src={deal.image}
                        alt={deal.title}
                        width={48}
                        height={32}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Side Deals - Only visible on mobile */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {sideDeals.map((deal, index) => (
            <Link href={deal.link} key={index}>
              <div className={`${deal.backgroundColor} rounded-lg p-4 h-24 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer`}>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 leading-tight mb-1">
                    {deal.title}
                  </h3>
                  <span className="text-xs text-blue-600 font-medium hover:underline">
                    {deal.buttonText}
                  </span>
                </div>
                <div className="w-12 h-8 ml-2">
                  <Image
                    src={deal.image}
                    alt={deal.title}
                    width={48}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-200 rounded-lg p-4 h-32 sm:h-40">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Smart savings on Apple
            </h3>
            <Link href="/deals" className="text-blue-600 font-medium hover:underline text-sm">
              Shop Deals
            </Link>
          </div>
          
          <div className="bg-blue-200 rounded-lg p-4 h-32 sm:h-40">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Up to 20% off Resold
            </h3>
            <Link href="/deals" className="text-blue-600 font-medium hover:underline text-sm">
              Shop Deals
            </Link>
          </div>
          
          <div className="bg-blue-200 rounded-lg p-4 h-32 sm:h-40">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Up to 40% off home improvement
            </h3>
            <Link href="/deals" className="text-blue-600 font-medium hover:underline text-sm">
              Shop Deals
            </Link>
          </div>
          
          <div className="bg-yellow-200 rounded-lg p-4 h-32 sm:h-40">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Up to 55% off
            </h3>
            <Link href="/deals" className="text-blue-600 font-medium hover:underline text-sm">
              Shop now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}