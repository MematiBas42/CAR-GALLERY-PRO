import { routes } from "@/config/routes";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { HeartIcon, HomeIcon, LayoutDashboard, MenuIcon } from "lucide-react";
import { Favourites } from "@/config/types";
import SignoutForm from "../auth/SignoutForm";
import { ThemeToggle } from "../ui/theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { auth } from "@/auth";
import { getSourceId } from "@/lib/source-id";
import { redis } from "@/lib/redis-store";

import { getTranslations } from "next-intl/server";

const Header = async () => {
  const t = await getTranslations("Navigation");
  const session = await auth();
  const sourceId = await getSourceId();
  
  let favs: Favourites | null = null;
  let liveFavCount = 0;
  try {
    if (sourceId) {
        favs = await redis.get<Favourites>(sourceId);
        if (favs && favs.ids.length > 0) {
            // Count only LIVE classifieds
            liveFavCount = await prisma.classified.count({
                where: {
                    id: { in: favs.ids },
                    status: "LIVE"
                }
            });
        }
    }
  } catch (error) {
    console.error("Redis or Prisma connection failed in Header:", error);
    favs = { ids: [] }; 
  }

  const navLinks = [
    { id: 1, href: routes.inventory, label: t("collection") },
    { id: 2, href: routes.financing, label: t("financing") },
    { id: 3, href: routes.ourPhilosophy, label: t("philosophy") },
    { id: 4, href: routes.contact, label: t("contact") },
  ];

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-transparent gap-x-6">
      <div className="flex items-center justify-center md:justify-start flex-1 gap-x-4">
        <Link href={routes.home} className="flex items-center gap-2">
          <Image
            src="/assets/logo.png"
            alt="RIM GLOBAL Logo"
            width={60}
            height={60}
            className="relative dark:invert"
            unoptimized
          />
          <div className="text-left md:text-left">
            <span className="text-xl font-bold text-primary">RIM GLOBAL</span>
            <p className="text-sm text-muted-foreground text-right md:text-right -mt-1">auto sales</p>
          </div>
        </Link>
        <LanguageSwitcher />
      </div>
      <nav className="hidden md:flex items-center gap-x-4">
        <Button asChild variant="outline" size="icon">
          <Link href={routes.home}>
            <HomeIcon className="w-6 h-6" />
          </Link>
        </Button>
        {navLinks.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className="px-4 py-2 text-sm uppercase font-medium text-foreground hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
        <Button asChild variant="outline" size="icon" className="relative">
            <Link href={routes.favourites}>
                <HeartIcon className="w-6 h-6" />
                <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 text-primary-foreground bg-primary rounded-full">
                    <span className="text-xs">
                        {liveFavCount}
                    </span>
                </div>
            </Link>
        </Button>
      </nav>
      <div className="items-center md:flex gap-x-2 hidden">
        {session ? (
            <>
                <Button asChild variant={'outline'} size={"icon"}>
                    <a href={routes.admin.dashboard}>
                    <LayoutDashboard className="w-6 h-6" />
                    </a>
                </Button>
                <SignoutForm />
            </>
        ) : null}
        <ThemeToggle />
      </div>
    
      <Sheet>
        <SheetTrigger asChild>
          <Button variant={"link"} className="md:hidden border-none">
            <MenuIcon className="w-6 h-6 text-foreground" />
            <SheetTitle className="sr-only">Navigate RIM GLOBAL</SheetTitle>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-xs p-6 bg-background">
          <div className="flex flex-col gap-8 mt-8">
            <div className="flex items-center justify-between">
                <span className="font-bold text-xl">Menu</span>
                <ThemeToggle />
            </div>
            <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                <Link
                    key={link.id}
                    href={link.href}
                    className="text-lg font-medium text-foreground hover:text-primary border-b border-muted pb-2"
                >
                    {link.label}
                </Link>
                ))}
                <Link
                    href={routes.favourites}
                    className="text-lg font-medium text-foreground hover:text-primary border-b border-muted pb-2 flex justify-between"
                >
                    {t("favorites")}
                    <span className="bg-primary text-primary-foreground px-2 rounded-full text-sm">
                        {liveFavCount}
                    </span>
                </Link>
            </nav>
            {session && (
                <div className="pt-4 border-t border-muted">
                    <Link href={routes.admin.dashboard} className="flex items-center gap-2 text-primary font-bold mb-4">
                        <LayoutDashboard className="w-5 h-5" /> Admin Panel
                    </Link>
                    <SignoutForm />
                </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
