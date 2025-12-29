import { routes } from "@/config/routes";
import Link from "next/link";
import React, { Suspense, cache } from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "../ui/sheet";
import { Button } from "../ui/button";
import { HeartIcon, HomeIcon, LayoutDashboard, MenuIcon } from "lucide-react";
import { Favourites } from "@/config/types";
import SignoutForm from "../auth/SignoutForm";
import { ThemeToggle } from "../ui/theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { auth } from "@/auth";
import { getSourceId } from "@/lib/source-id";
import { redis } from "@/lib/redis-store";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

const getLiveFavCount = cache(async (sourceId: string | undefined) => {
  if (!sourceId) return 0;
  try {
    const favs = await redis.get<Favourites>(sourceId);
    if (favs && Array.isArray(favs.ids) && favs.ids.length > 0) {
      return await prisma.classified.count({
        where: { id: { in: favs.ids }, status: "LIVE" }
      });
    }
  } catch (e) {}
  return 0;
});

const FavoriteCount = async ({ sourceId }: { sourceId: string | undefined }) => {
  const liveFavCount = await getLiveFavCount(sourceId);
  return <span className="text-xs">{liveFavCount}</span>;
};

const Header = async () => {
  const t = await getTranslations("Navigation");
  const session = await auth();
  const sourceId = await getSourceId();

  const navLinks = [
    { id: 1, href: routes.inventory, label: t("collection") },
    { id: 2, href: routes.financing, label: t("financing") },
    { id: 3, href: routes.ourPhilosophy, label: t("philosophy") },
    { id: 4, href: routes.contact, label: t("contact") },
  ];

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-transparent gap-x-2 overflow-hidden">
      <div className="flex items-center justify-start flex-1 gap-x-1 md:gap-x-4 min-w-0">
        <Link href={routes.home} className="flex items-center gap-2 min-w-0 flex-shrink-0">
          <div className="relative flex-shrink-0 h-8 w-auto md:h-12">
            <Image
              src="/assets/logo.png"
              alt="RIM GLOBAL Logo"
              width={120}
              height={45}
              className="relative dark:invert h-full w-auto object-contain"
              unoptimized
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm md:text-xl font-bold text-primary truncate leading-tight tracking-tight">RIM GLOBAL</span>
            <p className="text-[9px] md:text-sm text-muted-foreground leading-tight truncate">auto sales</p>
          </div>
        </Link>
        <div className="flex-shrink-0 ml-1">
            <LanguageSwitcher />
        </div>
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
                    <Suspense fallback={<span className="text-[10px]">...</span>}>
                        <FavoriteCount sourceId={sourceId} />
                    </Suspense>
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
                <SheetClose asChild key={link.id}>
                  <Link
                      href={link.href}
                      className="text-lg font-medium text-foreground hover:text-primary border-b border-muted pb-2"
                  >
                      {link.label}
                  </Link>
                </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                      href={routes.favourites}
                      className="text-lg font-medium text-foreground hover:text-primary border-b border-muted pb-2 flex justify-between items-center"
                  >
                      {t("favorites")}
                      <span className="bg-muted text-muted-foreground w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">
                        <Suspense fallback="...">
                            <FavoriteCount sourceId={sourceId} />
                        </Suspense>
                      </span>
                  </Link>
                </SheetClose>
            </nav>
            {session && (
                <div className="pt-4 border-t border-muted">
                    <SheetClose asChild>
                      <Link href={routes.admin.dashboard} className="flex items-center gap-2 text-primary font-bold mb-4">
                          <LayoutDashboard className="w-5 h-5" /> Admin Panel
                      </Link>
                    </SheetClose>
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