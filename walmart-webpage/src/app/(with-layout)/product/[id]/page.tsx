import React from 'react';
import { notFound } from 'next/navigation';
import * as db from '@/lib/db'; // Import your database functions directly
import ProductImageGallery from '@/components/product/ProductImageGallery';

// Helper component for Star Ratings
const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} filled />)}
            {halfStar && <Star key="half" filled half />}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} />)}
        </div>
    );
};

const Star = ({ filled = false, half = false }) => (
    <svg className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d={half ? "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" : "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"} />
    </svg>
);

// Define the structure of a Product
interface Product {
    product_id: number;
    product_name: string;
    description: string;
    final_price: number;
    initial_price?: number;
    brand: string;
    rating: number;
    review_count: number;
    main_image: string;
    image_urls: string[];
    specifications: { name: string; value: string }[];
}

// Define the expected props structure for a dynamic page
interface PageProps {
  params: { id: string };
}

// This is a Server Component, so we can make it async and fetch data directly.
export default async function ProductPage({ params }: PageProps) {
  // Validate and parse the ID from params
  const productId = parseInt(params.id, 10);
  if (isNaN(productId)) {
    notFound(); // If the ID is not a number, show a 404 page
  }
  
  // Directly call your database function. No more fetch!
  // This is more performant and solves the environment variable issue.
  const productData = await db.getProductDetails({ product_id: productId });

  // If the database returns an error or no product, show a 404 page.
  if (!productData || (productData as any).error) {
    notFound();
  }

  const product = productData as Product;

  const savings = product.initial_price && product.initial_price > product.final_price
    ? (product.initial_price - product.final_price).toFixed(2)
    : null;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Image Gallery */}
          <div className="lg:col-span-1">
            {/* The mainImage prop might be named differently in your dummy data */}
            <ProductImageGallery mainImage={product.main_image} imageUrls={product.image_urls} />
          </div>

          {/* Column 2: Product Info */}
          <div className="lg:col-span-1">
            <p className="text-sm text-blue-600 hover:underline cursor-pointer">{product.brand}</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.product_name}</h1>
            
            <div className="mt-3 flex items-center">
              <StarRating rating={product.rating} />
              <span className="ml-2 text-sm text-gray-500">{product.review_count} ratings</span>
            </div>
            
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">About this item</h2>
              <div className="mt-2 text-gray-700 space-y-4">
                <p>{product.description}</p>
              </div>
            </div>

            <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-800">Specifications</h3>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                    {product.specifications?.map((spec: {name: string, value: string}, index: number) => (
                        <li key={index}><span className="font-semibold">{spec.name}:</span> {spec.value}</li>
                    ))}
                </ul>
            </div>
          </div>

          {/* Column 3: Purchase Options */}
          <div className="lg:col-span-1">
             <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-baseline">
                  <span className="text-green-600 font-bold text-3xl">${product.final_price}</span>
                  {product.initial_price && (
                    <span className="ml-2 text-gray-500 line-through">${product.initial_price}</span>
                  )}
                </div>
                {savings && (
                    <p className="mt-1 text-sm text-gray-600">You save <span className="font-semibold">${savings}</span></p>
                )}
                <button className="mt-6 w-full bg-[#0071ce] text-white font-bold py-3 px-4 rounded-full hover:bg-blue-700 transition-colors">
                  Add to cart
                </button>
                <div className="mt-6 space-y-3">
                    <div className="flex items-center p-3 border rounded-md border-gray-400">
                        {/* Shipping Icon */}
                        <svg className="w-6 h-6 mr-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        <div>
                            <p className="font-semibold">Shipping</p>
                            <p className="text-sm text-gray-500">Arrives by Tue, Jul 15</p>
                        </div>
                    </div>
                    {/* Other options can be added here */}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}


