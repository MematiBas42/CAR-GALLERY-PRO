import { auth } from '@/auth'
import OtpForm from '@/components/auth/otp-form'
import React from 'react'

const ChallengePage = async () => {
  const session = await auth();
  
  return (
    <OtpForm email={session?.user?.email || ""} />
  )
}

export default ChallengePage
