import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis-store";
import { headers } from "next/headers";

// Create a new ratelimiter, that allows 5 requests per 1 hour
export const contactRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "ratelimit:contact",
});

// Create a new ratelimiter for newsletter, that allows 3 requests per 1 day
export const newsletterRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 d"),
  analytics: true,
  prefix: "ratelimit:newsletter",
});

// Generic ratelimiter for general forms (like reservation)
export const generalFormRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "ratelimit:general",
});

export const genericRateLimit = async (key: string = "general") => {
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await generalFormRateLimit.limit(`${ip}:${key}`);
  
  if (!success) {
    return { success: false, message: "Too many requests. Please try again later." };
  }
  
  return null;
}