import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis-store";

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