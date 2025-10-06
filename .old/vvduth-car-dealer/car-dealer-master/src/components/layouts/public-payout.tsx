import React, { PropsWithChildren } from 'react'
import Header from './header'
import PublicFooter from './footer'

const PublicLayout = (
    {children}: PropsWithChildren
) => {
  return (
    <div>
        <Header />
      <main className='bg-white'>
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}

export default PublicLayout
