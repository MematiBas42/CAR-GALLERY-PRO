import { EndButtons } from '@/components/shared/end-buttons'
import { XCircle } from 'lucide-react'
import React from 'react'


const NotAvailablePage = () => {
    return (
        <div className='flex items-center justify-center min-h-[80vh]'>
            <div className="flex flex-col items-center p-8 space-y-4">
                <XCircle className="w-16 h-16 text-muted-foreground" />
                <p className="text-lg font-semibold text-center">
                    Yo, that whip is already gone, fam! 🚗💨
                </p>
                <p className="text-center text-muted-foreground">
                    Don't stress though - we got mad other rides that'll have you cruising in style.
                    Peep the rest of our fire collection on the site!
                </p>
                <EndButtons />
            </div>
        </div>
    )
}


export default NotAvailablePage