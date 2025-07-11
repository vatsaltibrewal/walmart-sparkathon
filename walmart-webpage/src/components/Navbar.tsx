'use client'

import React, { useState } from 'react'
import { ShoppingCartIcon, MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useCart } from '../contexts/CartContext'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { itemCount, total } = useCart()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    const params = new URLSearchParams()
    if (value) params.set('search', value)
    router.push(`/?${params.toString()}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const categories = [
    { name: 'Departments', href: '/departments' },
    { name: 'Services', href: '/services' },
    { name: 'Get it Fast', href: '/fast-delivery' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Deals', href: '/deals' },
    { name: 'Dinner Made Easy', href: '/dinner-made-easy' },
    { name: 'Pharmacy Delivery', href: '/pharmacy' },
    { name: 'Trending', href: '/trending' },
  ]

  return (
    <>
      {/* Mobile/Tablet Header */}
      <nav className="bg-walmart-blue lg:hidden">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/walmart-logo.png"
                alt="Walmart"
                width={120}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>

            {/* Cart Icon */}
            <Link href="/cart" className="relative">
              <div className="text-white p-2 rounded-full hover:bg-blue-700 relative">
                <ShoppingCartIcon className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex-center bg-walmart-yellow text-black text-xs font-bold rounded-full h-5 w-5 min-w-[20px]">
                    {itemCount}
                  </span>
                )}
                <span className="absolute -bottom-6 right-0 text-xs text-white font-medium">
                  ${total.toFixed(0)}
                </span>
              </div>
            </Link>
          </div>

          {/* Mobile Search Bar */}
          <div className="pb-3">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded-full py-3 px-4 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-walmart-yellow"
                  placeholder="Search everything at Walmart online and in store"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-1.5 bg-walmart-yellow text-black p-2 rounded-full hover:bg-yellow-400"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Pickup/Delivery Info */}
          <div className="pb-3">
            <div className="flex items-center text-white text-sm">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2">
                <div className="w-3 h-3 bg-walmart-blue rounded-full"></div>
              </div>
              <span className="font-medium">Pickup or delivery?</span>
              <span className="ml-auto">Sacramento, 95829</span>
            </div>
          </div>
        </div>

        {/* Mobile Categories */}
        <div className="bg-white border-t border-gray-200">
          <div className="px-4 py-2">
            <div className="flex space-x-6 overflow-x-auto text-sm">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-gray-700 hover:text-walmart-blue whitespace-nowrap py-2"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Header */}
      <nav className="bg-walmart-blue hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/walmart-logo.png"
                alt="Walmart"
                width={140}
                height={36}
                className="h-9 w-auto"
                priority
              />
            </Link>

            {/* Pickup/Delivery */}
            <div className="flex items-center text-white text-sm ml-8">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2">
                <div className="w-3 h-3 bg-walmart-blue rounded-full"></div>
              </div>
              <div>
                <div className="font-medium">Pickup or delivery?</div>
                <div className="text-xs">Sacramento, 95829</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    className="w-full bg-white rounded-full py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-walmart-yellow"
                    placeholder="Search everything at Walmart online and in store"
                  />
                  <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1.5 bg-walmart-yellow text-black p-2 rounded-full hover:bg-yellow-400"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-6">
              {/* Reorder */}
              <div className="text-white text-center">
                <div className="text-xs">Reorder</div>
                <div className="text-sm font-medium">My Items</div>
              </div>

              {/* Sign In */}
              <div className="text-white text-center">
                <div className="text-xs">Sign In</div>
                <div className="text-sm font-medium">Account</div>
              </div>

              {/* Cart */}
              <Link href="/cart" className="relative group">
                <div className="text-white p-2 rounded-full hover:bg-blue-700 relative">
                  <ShoppingCartIcon className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex-center bg-walmart-yellow text-black text-xs font-bold rounded-full h-5 w-5 min-w-[20px]">
                      {itemCount}
                    </span>
                  )}
                  <div className="text-center mt-1">
                    <div className="text-xs font-medium">${total.toFixed(0)}</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Categories */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 text-sm">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-gray-700 hover:text-walmart-blue py-3 border-b-2 border-transparent hover:border-walmart-blue transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 w-80 h-full bg-white shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500">
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="block text-gray-700 hover:text-walmart-blue py-2 border-b border-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}