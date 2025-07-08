import React from 'react'
import CategoryPage from '../../../components/CategoryPage'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function Category({ params }: CategoryPageProps) {
  const resolvedParams = await params

  const category = resolvedParams.slug.toLowerCase() // 👈 normalize

  return <CategoryPage category={category} />
}

// Optional: statically generate category pages
export function generateStaticParams() {
  return [
    { slug: 'electronics' },
    { slug: 'appliances' },
    { slug: 'footwear' },
    { slug: 'toys' },
    { slug: 'sports' },
    { slug: 'baby' },
  ]
}
