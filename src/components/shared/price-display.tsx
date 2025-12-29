"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

interface PriceDisplayProps {
  amount: number; // In cents
  className?: string;
  showLocal?: boolean;
}

const localeToCurrency: Record<string, string> = {
  tr: "TRY",
  ko: "KRW",
  es: "EUR",
};

const currencySymbols: Record<string, string> = {
  USD: "$",
  TRY: "$",
  KRW: "$",
  EUR: "$",
  GBP: "$",
};

// Global client-side cache to prevent multiple fetches per page load
let globalCurrencyCache: Record<string, number> | null = null;
let isFetchingCurrency = false;
const subscribers: ((rates: Record<string, number>) => void)[] = [];

export function PriceDisplay({ amount, className = "", showLocal = true }: PriceDisplayProps) {
  const locale = useLocale();
  const [rates, setRates] = useState<Record<string, number> | null>(globalCurrencyCache);
  const usdAmount = amount / 100;

  useEffect(() => {
    if (!showLocal || rates) return;

    if (globalCurrencyCache) {
      setRates(globalCurrencyCache);
      return;
    }

    // Subscribe if already fetching
    if (isFetchingCurrency) {
      subscribers.push(setRates);
      return;
    }

    isFetchingCurrency = true;
    fetch("/api/currency")
      .then(res => res.json())
      .then(data => {
        const fetchedRates = data?.rates || null;
        globalCurrencyCache = fetchedRates;
        setRates(fetchedRates);
        // Notify all subscribers
        subscribers.forEach(sub => sub(fetchedRates));
        subscribers.length = 0;
      })
      .catch(err => console.error("Currency fetch failed", err))
      .finally(() => {
        isFetchingCurrency = false;
      });
  }, [showLocal, rates]);

  const targetCurrency = localeToCurrency[locale];
  let localPriceString = "";

  if (showLocal && targetCurrency && targetCurrency !== "USD" && rates) {
    const rate = rates[targetCurrency];
    if (rate) {
      const localAmount = usdAmount * rate;
      localPriceString = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: targetCurrency,
        maximumFractionDigits: 0,
      }).format(localAmount);
    }
  }

  return (
    <div className={`inline-flex items-baseline flex-wrap justify-center gap-x-2 gap-y-0.5 ${className}`}>
      <span className="font-bold whitespace-nowrap">
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(usdAmount)}
      </span>
      {localPriceString && (
        <span className="text-[0.6em] md:text-[0.7em] opacity-70 font-normal italic whitespace-nowrap">
          (≈ {localPriceString})
        </span>
      )}
    </div>
  );
}