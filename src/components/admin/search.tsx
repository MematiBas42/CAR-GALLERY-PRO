"use client"
import React from 'react'
import SearchInput from '../shared/search-input'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

const AdminSearch = () => {
  const t = useTranslations("Admin.sidebar");
  const tCommon = useTranslations("Common.actions");
  const pathname = usePathname();
  
  const getPlaceholder = () => {
    const section = pathname.split("/")[2];
    let sectionName = section;
    
    if (section === "cars") sectionName = t("cars");
    else if (section === "customers") sectionName = t("customers");
    else if (section === "dashboard") sectionName = t("dashboard");
    
    return `${tCommon("search")} ${sectionName}`;
  };

    return (
   
      <SearchInput
      placeholder={getPlaceholder()}
       className="w-full focus-visible:ring-0 placeholder:text-muted 
       text-muted appearance-none bg-primary-800 border border-primary-800 pl-8"
      />
    
  )
}

export default AdminSearch
