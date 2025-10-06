"use server";

import { issueChallenge } from "@/lib/otp";
import { auth } from "../../../auth";
import { completeChallenge } from "@/lib/otp";
import { genericRateLimit } from "@/lib/rate-limiter";
export const resendChallengeAction = async () => {

    const limiterError  = await genericRateLimit("otp");
    if (limiterError) {
        return limiterError;
    }
    const session = await auth();

    if (!session?.user) {
        return {
            success: false,
            message: "User not authenticated",
        }
    }
    await issueChallenge(session.user.id as string, session.user.email as string);

    return {
        success: true,
        message: "Code sent successfully",
    }
}

export const completeChallengeAction = async (code: string) => {
    const session = await auth();
    if (!session?.user) {
        return {
            success: false,
            message: "User not authenticated",
        }
    }

    const {id} = session.user;
    const result = await completeChallenge(id as string, code);

	return result;
}