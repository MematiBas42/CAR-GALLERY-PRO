"use client";

import React from "react";
import { Phone } from "lucide-react";
import { SITE_CONFIG } from "@/config/constants";
import { cn } from "@/lib/utils";

export const FloatingPhoneButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center justify-end group">
      {/* Phone Number Label - Slides out on hover (PC only focus for label overflow) */}
      <a
        href={`tel:${SITE_CONFIG.phoneRaw}`}
        className={cn(
          "mr-3 px-5 py-2 bg-primary text-primary-foreground rounded-full shadow-2xl",
          "font-bold text-base md:text-lg whitespace-nowrap opacity-0 translate-x-10 scale-50",
          "group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100",
          "transition-all duration-500 ease-out pointer-events-none group-hover:pointer-events-auto",
          "hidden md:block" // On mobile, we usually just want the icon or a very compact call
        )}
      >
        {SITE_CONFIG.phone}
      </a>

      {/* Main Floating Button - Sized reduced by ~15% */}
      <a
        href={`tel:${SITE_CONFIG.phoneRaw}`}
        className={cn(
          "flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground shadow-2xl",
          "hover:scale-110 active:scale-95 transition-transform duration-300 ease-in-out animate-bounce-slow"
        )}
        aria-label="Call Us"
      >
        <Phone className="w-5 h-5 md:w-6 md:h-6 fill-current" />
      </a>
    </div>
  );
};
