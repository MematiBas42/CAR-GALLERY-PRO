"use client"
import React from 'react'
import SearchInput from '../shared/search-input'
import { usePathname } from 'next/navigation'

const AdminSearch = () => {
  const pathname = usePathname()
    return (
   
      <SearchInput
      placeholder={`search ${pathname.split("/")[2]}`}
       className="w-full focus-visible:ring-0 placeholder:text-muted 
       text-muted appearance-none bg-primary-800 border border-primary-800 pl-8"
      />
    
  )
}

export default AdminSearch
