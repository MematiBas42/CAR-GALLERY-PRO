import React, { useTransition, useEffect } from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { HeartIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { endpoints } from '@/config/endpoints'
import { setIsLoading } from '@/hooks/use-loading'


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
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsLoading(isPending, `fav-update-${id}`);
    return () => setIsLoading(false, `fav-update-${id}`);
  }, [isPending, id]);

  const handlefavClick = async () => {
    // 1. Optimistic Update - Change UI state immediately
    const nextFavState = !isFav;
    setIsFav(nextFavState);

    // 2. Server Sync - Run in background with transition
    startTransition(async () => {
        try {
            const { ids } = await api.post<{ids: number[]}>(endpoints.favourites, {
                json: { id }
            });

            // Final sync check (optional, ensures UI matches server data)
            const actuallyFav = ids.includes(id);
            if (actuallyFav !== nextFavState) {
                setIsFav(actuallyFav);
            }
            
            router.refresh();
        } catch (error) {
            console.error("Failed to update favorites:", error);
            // Revert on error
            setIsFav(isFav);
        }
    });
  }
  return (
    <Button 
    onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handlefavClick();
    }}
    size={"icon"}
    variant={"ghost"}
     className={cn(`absolute top-12 left-3.5 rounded-full
         z-10 group !h-6 !w-6 lg:!h-8 lg:!w-8 xl:!h-10 xl:!w-10 transition-all duration-200`,
         isFav ? 'bg-red-500 hover:bg-red-600 shadow-lg' : 'bg-gray-200 hover:bg-red-500/20')}
    >
        <HeartIcon 
         className={cn(`duration-300 transition-all
             ease-in-out w-3.5 h-3.5 lg:w-5 lg:h-5 xl:w-6 xl:h-6`,
             isFav 
               ? 'text-white fill-white scale-110' 
               : 'text-gray-500 fill-none group-hover:text-red-500 group-hover:scale-110'
         )}
        />
    </Button>
  )
}

export default FavButton
