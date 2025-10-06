import { routes } from "@/config/routes";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { HeartIcon, MenuIcon } from "lucide-react";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
import { Favourites } from "@/config/types";
import { auth } from "@/auth";
import SignoutForm from "../auth/SignoutForm";

const navLinks = [
  { id: 1, href: routes.home, label: "Home" },
  { id: 2, href: routes.inventory, label: "Inventory" },
];
const Header = async () => {
  const sourceId = await getSourceId();
  const session = await auth();
  const favs = await redis.get<Favourites>(sourceId ?? "");
  return (
    <header className="flex items-center justify-between h-16 px-4 bg-transparent gap-x-6">
      <div className="flex items-center flex-1">
        <Link href={routes.home} className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full relative"
          />
        </Link>
      </div>
      <nav className="hidden md:block">
        {navLinks.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className="px-4 py-2 text-sm uppercase font-medium text-gray-600 hover:text-gray-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {session ? (
        <div className="items-center md:flex gap-x-6 hidden">
          <Link href={routes.admin.dashboard}
           className="text-foreground"
          >
            Admin office
          </Link>
          <SignoutForm />
        </div>
      ): (
  <Button
					asChild
					variant="ghost"
					size="icon"
					className="relative inline-block group"
				>
					<Link href={routes.favourites}>
						<div className="flex group-hover:bg-pink-500 diratopm-200 transition-colors ease-in-out items-center justify-center w-10 h-10 bg-muted rounded-full">
							<HeartIcon className="w-6 h-6 text-primary group-hover:text-white group-hover:fill-white" />
						</div>
						<div className="absolute -top-1 5 -right-1.5 flex items-center justify-center w-5 h-5 text-white bg-pink-500 rounded-full group-hover:bg-primary">
							<span className="text-xs">
								{favs ? favs.ids.length : 0}
							</span>
						</div>
					</Link>
				</Button>
      )}
    
      <Sheet>
        <SheetTrigger asChild>
          <Button variant={"link"} className="md:hidden border-none">
            <MenuIcon className="w-6 h-6 text-foreground" />
            <SheetTitle className="sr-only">Open Menu</SheetTitle>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-xs p-4">
          <nav className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
