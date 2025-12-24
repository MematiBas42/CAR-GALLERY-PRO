import { EndButtons } from '@/components/shared/end-buttons'
import { XCircle } from 'lucide-react'
import React from 'react'
import { getTranslations } from 'next-intl/server'


const NotAvailablePage = async () => {
    const t = await getTranslations("Errors.notAvailable");
    return (
        <div className='flex items-center justify-center min-h-[80vh]'>
            <div className="flex flex-col items-center p-8 space-y-4">
                <XCircle className="w-16 h-16 text-muted-foreground" />
                <p className="text-lg font-semibold text-center">
                    {t("slangTitle")}
                </p>
                <p className="text-center text-muted-foreground">
                    {t("description")}
                </p>
                <EndButtons />
            </div>
        </div>
    )
}


export default NotAvailablePage