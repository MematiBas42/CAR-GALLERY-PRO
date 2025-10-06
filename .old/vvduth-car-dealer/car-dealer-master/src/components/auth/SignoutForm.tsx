"use client"
import React from 'react'
import { Button } from '../ui/button'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { signOutAction } from '@/app/_actions/sign-out'


const SignOutButton = () => {
    
    const {pending} = useFormStatus()
    return (
        <Button
            type='submit'
            disabled={pending}
            className='flex items-center gap-2'
        >
            {pending ? (<Loader2
            
            className='mr-2 h-4 w-4 animate-spin'/>):(
                <span>Sign Out</span>
            )}
        </Button>
    )
}
const SignoutForm = () => {
  return (
    <div>
      <form action={signOutAction}>
        <SignOutButton/>
      </form>
    </div>
  )
}

export default SignoutForm
