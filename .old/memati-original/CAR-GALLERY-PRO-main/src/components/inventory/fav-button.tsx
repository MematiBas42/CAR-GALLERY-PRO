"use client"
import React from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { HeartIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { endpoints } from '@/config/endpoints'


interface FavButtonProps {
  setIsFav: (isFav: boolean) => void
  isFav: boolean
  id: number
}

const FavButton = ({
  setIsFav,
  isFav,
  id
}: FavButtonProps) => {
  const router = useRouter()

  const handlefavClick = async () => {
    const {ids}  = await api.post<{ids: number[]}>(endpoints.favourites, {
      json: {id}
    })

    if (ids.includes(id) ){
      setIsFav(true)
    }
    else {
      setIsFav(false)
    }

    setTimeout(() => {
      router.refresh()
    }, 250);
  }
  return (
    <Button 
    onClick={handlefavClick}
    size={"icon"}
    variant={"ghost"}
     className={cn(`absolute top-2.5 left-3.5 rounded-full
         z-10 group !h-6 !w-6 lg:!h-8 lg:!w-8 xl:!h-10 xl:!w-10`,
         isFav ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-200 hover:bg-gray-300')}
    >
        <HeartIcon 
         className={cn(`duration-200 transition-colors
             ease-in-out w-3.5 h-3.5 lg:w-5 lg:h-5 xl:w-6 xl:h-6
             text-white`,
             isFav ? 'text-white' : 'text-gray-500 group-hover:text-gray-700')}
        />
    </Button>
  )
}

export default FavButton
