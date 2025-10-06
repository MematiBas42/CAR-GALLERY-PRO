"use client"
import { imgixLoader } from '@/lib/imgix-loader'
import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import React from 'react'

type ImgixImageProps = Omit<ImageProps, 'priority' | 'loading'>

const ImgixImage = (props: ImgixImageProps) => {
    const [error, seterror] = useState(false)

    if (error) {
        return (
            <Image fetchPriority='high' {...props} />
        )
    }
  return (
		<Image
			fetchPriority="high"
			loader={(imgProps) => imgixLoader(imgProps)}
			onError={() => seterror(true)}
			{...props}
		/>
	);
}

export default ImgixImage