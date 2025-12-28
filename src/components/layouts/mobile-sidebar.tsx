"use client";
import { routes } from "@/config/routes";
import {
  CarFrontIcon,
  LayoutDashboardIcon,
  MailIcon,
  SettingsIcon,
  UsersIcon,
  UserPlusIcon,
  StarIcon,
  FileCodeIcon,
  MenuIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import ActiveLink from "../ui/active-link";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const MobileSidebar = () => {
  const t = useTranslations("Admin.sidebar");
  const [open, setOpen] = useState(false);

  const navigation = [
    {
      name: t("dashboard"),
      href: routes.admin.dashboard,
      icon: LayoutDashboardIcon,
    },
    {
      name: t("cars"),
      href: routes.admin.cars,
      icon: CarFrontIcon,
    },
    {
      name: t("latestArrivals"),
      href: routes.admin.latestArrivals,
      icon: StarIcon,
    },
    {
      name: t("customers"),
      href: routes.admin.customers,
      icon: UsersIcon,
    },
    {
      name: t("messages"),
      href: routes.admin.messages,
      icon: MailIcon,
    },
    {
      name: t("subscribers"),
      href: routes.admin.subscribers,
      icon: UserPlusIcon,
    },
    {
      name: "Email Templates",
      href: routes.admin.emailTemplates,
      icon: FileCodeIcon,
    },
    {
      name: t("settings"),
      href: routes.admin.settings,
      icon: SettingsIcon,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-gray-900 border-r-gray-800 p-0 text-gray-100">
        <SheetHeader className="p-4 border-b border-gray-800">
          <SheetTitle className="text-left">
             <div className="relative h-[40px] w-[120px]">
                <Image
                    alt="RIM GLOBAL logo"
                    src={"/logo.svg"}
                    fill={true}
                    className="object-contain object-left invert"
                />
             </div>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 p-4">
          <nav className="flex flex-col gap-2">
            {navigation.map((item) => (
              <SheetClose asChild key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </SheetClose>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
