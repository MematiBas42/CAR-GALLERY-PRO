import React, { PropsWithChildren } from 'react'
import Header from './header'
import PublicFooter from './footer'
import { ThemeProvider } from "./theme-provider";
import { CookieConsent } from "../shared/cookie-consent";

const PublicLayout = ({children}: PropsWithChildren) => {
  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
    >
        <Header />
      <main className='bg-background min-h-screen'>
        {children}
      </main>
      <PublicFooter />
      <CookieConsent />
    </ThemeProvider>
  )
}

export default PublicLayout