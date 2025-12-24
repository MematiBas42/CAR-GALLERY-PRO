import type { Metadata } from "next";
import "./globals.css";
import { Mulish, Roboto } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import {NextIntlClientProvider} from 'next-intl';
import { cookies } from 'next/headers';

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
  title: "RIM GLOBAL",
  description: "Federal Way's Curated Automotive Collection",};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    messages = (await import(`../../messages/en.json`)).default;
  }

  return (
		<html lang={locale} suppressHydrationWarning>
      <body
				className={cn(
					"antialiased bg-background font-heading",
					roboto.variable,
					mulish.variable,
				)}
			>
        <NextIntlClientProvider locale={locale} messages={messages}>
            <NextTopLoader showSpinner={true} />
            <NuqsAdapter>
                <Suspense>
                    {children}
                </Suspense>
            </NuqsAdapter>
            <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}