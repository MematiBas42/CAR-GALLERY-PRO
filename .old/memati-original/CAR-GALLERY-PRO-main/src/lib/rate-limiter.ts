import type { PrevState } from "@/config/types";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { differenceInMinutes } from "date-fns";
import { headers } from "next/headers";
const rateLimitLogin = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 requests per 10 minutes
});

const ratelimitOtp = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "10 m"),
});

async function genericRateLimiter(type: "login" | "otp") {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "";
  return type === "otp" ? ratelimitOtp.limit(ip) : rateLimitLogin.limit(ip);
}

export async function genericRateLimit(type: "login" | "otp")
: Promise<PrevState|undefined>{
  const { success, reset } = await genericRateLimiter(type);
  const resettime = new Date(reset);
  const now = new Date();
  const diffInSecs = Math.round((resettime.getTime() - now.getTime()) / 1000);
  if (!success) {
    if (diffInSecs < 60) {
      const resetTimeInMins = differenceInMinutes(resettime, now);
      return {
        success: false,
        message: `Too many requests, please try again in ${resetTimeInMins} minutes.`,
      };
    }

    return {
      success: false,
      message: `Too many attempts. Please try again in ${diffInSecs} minute${diffInSecs > 1 ? "s" : ""}`,
    };
  }
}
