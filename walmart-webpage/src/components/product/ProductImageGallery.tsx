'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Props {
  mainImage: string;
  imageUrls?: string[];
}

export default function ProductImageGallery({ mainImage, imageUrls = [] }: Props) {
  const allImages = [mainImage, ...imageUrls];
  const [activeImage, setActiveImage] = useState(mainImage);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-2">
        {allImages.slice(0, 5).map((img, index) => (
          <div
            key={index}
            className={`cursor-pointer border-2 rounded-lg overflow-hidden ${activeImage === img ? 'border-blue-600' : 'border-transparent'}`}
            onClick={() => setActiveImage(img)}
          >
            <Image src={img} alt={`Product thumbnail ${index + 1}`} width={80} height={80} className="object-cover w-20 h-20" />
          </div>
        ))}
      </div>
      <div className="flex-1">
        <Image src={activeImage} alt="Main product image" width={500} height={500} className="w-full h-auto object-contain rounded-lg" />
      </div>
    </div>
  );
}