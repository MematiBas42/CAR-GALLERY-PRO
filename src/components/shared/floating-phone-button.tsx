"use client";

import React from "react";
import { Phone } from "lucide-react";
import { SITE_CONFIG } from "@/config/constants";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export const FloatingPhoneButton = () => {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-[2147483647] flex items-center justify-end pointer-events-none"
      style={{ isolation: 'isolate' }}
    >
      <div className="flex items-center group/phone-container">
        {/* Phone Number Label - Pure CSS Hover */}
        <a
          href={`tel:${SITE_CONFIG.phoneRaw}`}
          className={cn(
            "mr-3 px-5 py-2 bg-primary text-primary-foreground rounded-full shadow-2xl",
            "font-bold text-base md:text-lg whitespace-nowrap transition-all duration-300 ease-out",
            "hidden md:block opacity-0 translate-x-4 scale-95 pointer-events-none",
            "group-hover/phone-container:opacity-100 group-hover/phone-container:translate-x-0 group-hover/phone-container:scale-100 group-hover/phone-container:pointer-events-auto"
          )}
        >
          {SITE_CONFIG.phone}
        </a>

        {/* Main Floating Button - Pure CSS Animation */}
        <a
          href={`tel:${SITE_CONFIG.phoneRaw}`}
          className={cn(
            "flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground shadow-2xl shrink-0 pointer-events-auto",
            "transition-all duration-300 ease-in-out hover:scale-110 active:scale-90",
            "md:animate-bounce-slow group-hover/phone-container:animate-none"
          )}
          aria-label="Call Us"
        >
          <Phone className="w-5 h-5 md:w-6 md:h-6 fill-current" />
        </a>
      </div>
    </div>
  );
};
