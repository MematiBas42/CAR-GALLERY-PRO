import { redis } from "./redis-store";

// Cache expiration in seconds (24 hours)
const CACHE_TTL = 24 * 60 * 60;
const CACHE_KEY = "exchange_rates_usd";

interface ExchangeRates {
  amount: number;
  base: string;
  date: string;
  rates: {
    [key: string]: number;
  };
}

/**
 * Fetches exchange rates from Frankfurter API with Redis caching.
 * Base currency is USD.
 */
export async function getExchangeRates(): Promise<ExchangeRates | null> {
  try {
    // 1. Check Cache
    const cachedRates = await redis.get<ExchangeRates>(CACHE_KEY);
    if (cachedRates) {
      return cachedRates;
    }

    // 2. Fetch from API (Frankfurter)
    // Note: Frankfurter uses EUR as base by default for free tier, but allows conversion.
    // We request conversion from USD to other major currencies.
    const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR,TRY,KRW,CNY,JPY,CAD");
    
    if (!response.ok) {
      console.error("Currency API Error:", response.statusText);
      return null;
    }

    const data = await response.json();

    // 3. Save to Cache
    await redis.set(CACHE_KEY, data, { ex: CACHE_TTL });

    return data as ExchangeRates;
  } catch (error) {
    console.error("Currency Service Error:", error);
    return null;
  }
}

/**
 * Converts a USD amount to the target currency using cached rates.
 */
export async function convertCurrency(amountInUsd: number, targetCurrency: string): Promise<number | null> {
  // If target is USD, no conversion needed
  if (targetCurrency === "USD") return amountInUsd;

  const ratesData = await getExchangeRates();
  
  if (!ratesData || !ratesData.rates[targetCurrency]) {
    return null; // Conversion not available
  }

  const rate = ratesData.rates[targetCurrency];
  return amountInUsd * rate;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}