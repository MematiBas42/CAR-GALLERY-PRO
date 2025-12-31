"use client";

import React, { useState } from "react";
import { Phone } from "lucide-react";
import { SITE_CONFIG } from "@/config/constants";
import { cn } from "@/lib/utils";

export const FloatingPhoneButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="fixed bottom-6 right-6 z-[9999] flex items-center justify-end"
      onMouseLeave={() => setIsHovered(false)} // Only hide when leaving the entire area
    >
      {/* Phone Number Label - Slides out on hover */}
      <a
        href={`tel:${SITE_CONFIG.phoneRaw}`}
        className={cn(
          "mr-3 px-5 py-2 bg-primary text-primary-foreground rounded-full shadow-2xl",
          "font-bold text-base md:text-lg whitespace-nowrap",
          "transition-all duration-300 ease-out",
          "hidden md:block",
          isHovered
            ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-x-4 scale-95 pointer-events-none"
        )}
      >
        {SITE_CONFIG.phone}
      </a>

      {/* Main Floating Button */}
      <a
        href={`tel:${SITE_CONFIG.phoneRaw}`}
        onMouseEnter={() => setIsHovered(true)} // Show when entering the icon
        className={cn(
          "flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground shadow-2xl shrink-0",
          "hover:scale-110 active:scale-95 transition-transform duration-300 ease-in-out",
          !isHovered && "animate-bounce-slow" // Only bounce when not expanded
        )}
        aria-label="Call Us"
      >
        <Phone className="w-5 h-5 md:w-6 md:h-6 fill-current" />
      </a>
    </div>
  );
};
