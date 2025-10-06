import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Mulish, Roboto } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

const mulish = Mulish({
	weight: "variable",
	subsets: ["latin"],
	variable: "--font-heading",
	display: "swap",
});

const roboto = Roboto({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-body",
	display: "swap",
});
export const metadata: Metadata = {
  title: "Meat Motors",
  description: "Love meat? Love motors? We do too! Welcome to Meat Motors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
		<html lang="en">
      <body
				className={cn(
					"antialiased overscroll-none bg-background font-heading",
					roboto.variable,
					mulish.variable,
				)}
			>
        <NextTopLoader showSpinner={true} />
        <NuqsAdapter>
			<Suspense>
				{children}
			</Suspense>
		</NuqsAdapter>
        <Toaster />
      </body>
    </html>
	
  );
}
