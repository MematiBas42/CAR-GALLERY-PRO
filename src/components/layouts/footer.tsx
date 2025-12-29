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
      href: "https://www.facebook.com/profile.php?id=61581943132077", 
      icon: <Facebook className="w-6 h-6" />,
      label: "Facebook",
      hoverClass: "hover:text-blue-600"
    },
    { 
      id: "ig", 
      href: "https://www.instagram.com/rimglobal_autosales/", 
      icon: <Instagram className="w-6 h-6" />,
      label: "Instagram",
      hoverClass: "hover:text-pink-600"
    },
    { 
      id: "wa", 
      href: "https://wa.me/12532149003", 
      icon: <MessageCircle className="w-6 h-6" />,
      label: "WhatsApp",
      hoverClass: "hover:text-green-500"
    },
  ];

  return (
    <footer className="bg-secondary px-8 lg:px-0 py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left mb-12 items-start">
          {/* Column 1: Branding */}
          <div className="flex flex-col items-center md:items-start gap-y-6">
            <Link href={routes.home} className="flex flex-col sm:flex-row items-center gap-4">
              <Image
                src="/assets/logo.png"
                alt="RIM GLOBAL Logo"
                width={280}
                height={280}
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
                  className="text-foreground hover:text-primary"
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
                <address className="not-italic text-muted-foreground">
                1505 S 356th Street, STE 114-4<br />Federal Way, WA 98003
                </address>
                <div className="flex flex-col gap-1">
                  <a href="tel:+12532149003" className="text-lg md:text-xl font-extrabold text-foreground hover:text-primary transition-colors">
                      (253) 214-9003
                  </a>
                  <p>
                  <a href="mailto:info@rimglobalauto.com" className="text-foreground hover:text-primary transition-colors">
                      info@rimglobalauto.com
                  </a>
                  </p>
                </div>
            </div>
            <div className="mt-4">
                <Button asChild variant="ghost" size="icon">
                    <a href={session ? routes.admin.dashboard : routes.signIn}>
                        <LayoutDashboard className="w-6 h-6" />
                    </a>
                </Button>
            </div>
          </div>
        </div>

        {/* Social Icons - Centered on Page */}
        <div className="flex flex-col items-center gap-y-4 mb-12">
          <p className="text-base md:text-lg text-muted-foreground text-center max-w-2xl">
            {tFooter("followUs")}
          </p>
          <div className="flex justify-center gap-6">
            {socialLinks.map((social) => (
              <Button key={social.id} asChild variant="outline" size="icon" className={cn("rounded-full border-gray-700 bg-transparent transition-all duration-300 h-11 w-11", social.hoverClass)}>
                <a href={social.href} target="_blank" rel="noopener noreferrer" title={social.label}>
                  {social.icon}
                </a>
              </Button>
            ))}
          </div>
        </div>

        {/* Newsletter Section - Centered */}
        <div className="flex flex-col items-center text-center mt-12">
          <NewsLetterForm />
        </div>

        {/* Legal Links - Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RIM GLOBAL. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
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