"use client"
import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import React from 'react'
import { getImageUrl, cn } from '@/lib/utils'

interface ImgixImageProps extends Omit<ImageProps, 'priority' | 'loading'> {
    smartCover?: boolean;
}

const ImgixImage = ({ smartCover, className, alt, ...props }: ImgixImageProps) => {
    const [error, setError] = useState(false)
    const finalSrc = getImageUrl(props.src as string)

    if (smartCover) {
        const { width, height, ...rest } = props;
        return (
            <div className={cn("relative overflow-hidden w-full h-full", className)}>
                {/* Blurred background filler */}
                <Image
                    {...rest}
                    src={finalSrc}
                    alt="Background blur"
                    fill
                    className="object-cover blur-3xl scale-110 opacity-40"
                    quality={1} // Extremely low quality for blur
                    priority={false}
                />
                {/* Main centered image */}
                <Image
                    {...rest}
                    src={finalSrc}
                    alt={alt}
                    fill
                    className="object-contain relative z-10"
                    onError={() => setError(true)}
                    quality={props.quality || 75}
                />
            </div>
        )
    }

    if (error) {
        return (
            <Image 
                fetchPriority='high' 
                {...props}
                src={finalSrc}
                unoptimized={true}
                alt={alt}
                className={className}
            />
        )
    }

    return (
		<Image
			fetchPriority="high"
			onError={() => setError(true)}
			{...props}
            src={finalSrc}
            alt={alt}
            className={className}
		/>
	);
}

export default ImgixImage