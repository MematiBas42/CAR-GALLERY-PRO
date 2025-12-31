"use client"
import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import React from 'react'
import { getImageUrl, cn } from '@/lib/utils'
import { imgixLoader } from '@/lib/imgix-loader'

interface ImgixImageProps extends Omit<ImageProps, 'loading'> {
    smartCover?: boolean;
}

const ImgixImage = ({ smartCover, className, alt, ...props }: ImgixImageProps) => {
    const [error, setError] = useState(false)
    const finalSrc = getImageUrl(props.src as string)

    const isSvg = typeof props.src === 'string' && props.src.toLowerCase().endsWith('.svg');

    if (smartCover) {
        const { width, height, ...rest } = props;
        
        // Generate a tiny URL for the background blur
        let blurSrc = finalSrc;
        try {
            const url = new URL(finalSrc);
            url.searchParams.set('w', '20');
            url.searchParams.set('q', '10');
            url.searchParams.set('auto', 'format,compress');
            blurSrc = url.toString();
        } catch (e) {
            // Fallback to original if URL is invalid
        }

        return (
            <div className={cn("relative overflow-hidden w-full h-full bg-black/10", className)}>
                {/* CSS Blur Background using a tiny 20px image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center blur-3xl scale-110 opacity-50"
                    style={{ backgroundImage: `url(${blurSrc})` }}
                />
                {/* Main centered image */}
                <Image
                    {...rest}
                    loader={isSvg ? undefined : imgixLoader}
                    unoptimized={isSvg}
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
			onError={() => setError(true)}
			{...props}
            loader={isSvg ? undefined : imgixLoader}
            unoptimized={isSvg || props.unoptimized}
            src={finalSrc}
            alt={alt}
            className={className}
		/>
	);
}

export default ImgixImage