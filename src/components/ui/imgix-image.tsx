"use client"
import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import React from 'react'

type ImgixImageProps = Omit<ImageProps, 'priority' | 'loading'>

const ImgixImage = (props: ImgixImageProps) => {
    const [error, setError] = useState(false)

    // Fallback to unoptimized if error occurs or strictly local assets if needed
    // But Next.js handles local optimization well.
    
    if (error) {
        // Fallback placeholder or just render as unoptimized to try loading original
        return (
            <Image 
                fetchPriority='high' 
                {...props} 
                unoptimized={true}
            />
        )
    }

    return (
		<Image
			fetchPriority="high"
			// No custom loader, use Next.js default optimization
			onError={() => setError(true)}
			{...props}
		/>
	);
}

export default ImgixImage