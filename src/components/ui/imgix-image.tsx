"use client"
import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import React from 'react'
import { getImageUrl } from '@/lib/utils'

type ImgixImageProps = Omit<ImageProps, 'priority' | 'loading'>

const ImgixImage = (props: ImgixImageProps) => {
    const [error, setError] = useState(false)
    const finalSrc = getImageUrl(props.src as string)

    if (error) {
        return (
            <Image 
                fetchPriority='high' 
                {...props}
                src={finalSrc}
                unoptimized={true}
            />
        )
    }

    return (
		<Image
			fetchPriority="high"
			onError={() => setError(true)}
			{...props}
            src={finalSrc}
		/>
	);
}

export default ImgixImage