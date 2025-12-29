import { routes } from "@/config/routes";
import Link from "next/link";
import React from "react";
import NewsLetterForm from "./NewsLetterForm";
import { auth } from "@/auth";
import { Button } from "../ui/button";
import { LayoutDashboard, Facebook, Instagram, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { SITE_CONFIG } from "@/config/constants";

const PublicFooter = async () => {
  const tNav = await getTranslations("Navigation");
  const tFooter = await getTranslations("Footer");
  const session = await auth();

  const navLinks = [
    { id: 1, href: routes.inventory, label: tNav("collection") },
    { id: 2, href: routes.financing, label: tNav("financing") },
    { id: 3, href: routes.ourPhilosophy, label: tNav("philosophy") },
    { id: 4, href: routes.contact, label: tNav("contact") },
  ];

  const socialLinks = [
    { 
      id: "fb", 
      href: SITE_CONFIG.socials.facebook, 
      icon: <Facebook className="w-6 h-6" />,
      label: "Facebook",
      hoverClass: "hover:text-blue-600"
    },
    { 
      id: "ig", 
      href: SITE_CONFIG.socials.instagram, 
      icon: <Instagram className="w-6 h-6" />,
      label: "Instagram",
      hoverClass: "hover:text-pink-600"
    },
    { 
      id: "wa", 
      href: SITE_CONFIG.socials.whatsapp, 
      icon: <MessageCircle className="w-6 h-6" />,
      label: "WhatsApp",
      hoverClass: "hover:text-green-500"
    },
  ];

  return (
    <footer className="bg-secondary px-8 lg:px-0 py-10">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left mb-8 items-start">
          {/* Column 1: Branding */}
          <div className="flex flex-col items-center md:items-start gap-y-4">
            <Link href={routes.home} className="flex flex-col sm:flex-row items-center gap-4">
              <Image
                src="/assets/logo.png"
                alt="RIM GLOBAL Logo"
                width={220}
                height={220}
                className="dark:invert"
                unoptimized
              />
              <div>
                <span className="text-2xl font-bold text-primary">RIM GLOBAL</span>
                <p className="text-md text-muted-foreground text-right -mt-1">auto sales</p>
              </div>
            </Link>
          </div>

          {/* Column 2: Navigation */}
          <ul className="space-y-2 flex flex-col items-center md:items-start">
            {navLinks.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Column 3: Contact Info & Admin Link */}
          <div className="flex flex-col justify-between h-full items-center md:items-end">
            <div className="space-y-2 text-center md:text-right">
                <h3 className="text-xl font-bold text-primary">{tFooter("contactUs")}</h3>
                <address className="not-italic text-muted-foreground text-sm">
                {SITE_CONFIG.address}
                </address>
                <div className="flex flex-col gap-1 mt-2">
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-lg md:text-xl font-extrabold text-foreground hover:text-primary transition-colors">
                      {SITE_CONFIG.phone}
                  </a>
                  <p>
                  <a href={`mailto:${SITE_CONFIG.email}`} className="text-sm text-foreground hover:text-primary transition-colors">
                      {SITE_CONFIG.email}
                  </a>
                  </p>
                </div>
            </div>
            <div className="mt-4">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 opacity-50 hover:opacity-100">
                    <a href={session ? routes.admin.dashboard : routes.signIn}>
                        <LayoutDashboard className="w-5 h-5" />
                    </a>
                </Button>
            </div>
          </div>
        </div>

        {/* Social Icons - Centered on Page - Compacted Spacing */}
        <div className="flex flex-col items-center gap-y-3 mb-8">
          <p className="text-sm md:text-base text-muted-foreground text-center max-w-2xl">
            {tFooter("followUs")}
          </p>
          <div className="flex justify-center gap-4">
            {socialLinks.map((social) => (
              <Button key={social.id} asChild variant="outline" size="icon" className={cn("rounded-full border-gray-700 bg-transparent transition-all duration-300 h-10 w-10", social.hoverClass)}>
                <a href={social.href} target="_blank" rel="noopener noreferrer" title={social.label}>
                  {social.icon}
                </a>
              </Button>
            ))}
          </div>
        </div>

        {/* Newsletter Section - Centered */}
        <div className="flex flex-col items-center text-center mt-8">
          <NewsLetterForm />
        </div>

        {/* Legal Links - Bottom */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RIM GLOBAL. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-3">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;