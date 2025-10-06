"use client";
import { OTPSchema, OTPSchemaType } from "@/app/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import OTPInput from "./otp-input";
import { Button } from "../ui/button";
import { Loader2, RotateCw } from "lucide-react";
import { completeChallengeAction, resendChallengeAction } from "@/app/_actions/challenge";
import { toast } from "sonner";

const OtpForm = () => {
  const [isCodePending, startCodeTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();
    const [sendButtontext, setSendButtontext] = useState("Send Code");

  
  const router = useRouter();
  const form = useForm<OTPSchemaType>({
    resolver: zodResolver(OTPSchema),
  });
  const onSubmit: SubmitHandler<OTPSchemaType> = async (data) => {
    startSubmitTransition(async () => {
      // complete OTP action
      const result =  await completeChallengeAction(data.code);
      console.log("OTP result", result);
      if (!result?.success) {
        toast.error("Error completing OTP", {
          description: result.message,
        });
        return;
      } else {
        console.log("OTP completed successfully");
      }
    })
  };
  const sendCode = async () => {
    startCodeTransition(async () => {
      // Simulate sending code
      
      const {
        success, message
      } = await resendChallengeAction ();
      // Here you would typically call an API to send the OTP code
      setSendButtontext("Resend code");
      if (!success) {
        toast.error("Eror sending code",{
          description: message,
        });
      }
      toast.success("Code sent successfully", {
        description: "Please check your email for the code.",
      })
    });
  }

  useEffect(() => {
    if (isCodePending) {
      setSendButtontext("Sending...");
    }
  },[])
  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex w-full flex-1 justify-center
  px-6 pt-10 lg:items-center lg:pt-0"
    >
      <div className="flex w-full max-w-lg flex-col">
        <h3 className="mb-4 text-4xl md:text-5xl text-center">
          One time password
        </h3>
        <p className="mb-12 text-center text-slate-500 ">
          Enter 6 digits code send to your email.{" "}
        </p>
        <Form {...form}>
          <form action="" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="code"
              render={({ field: { ref, onChange, ...rest } }) => (
                <FormItem className="mb-6">
                  <FormControl>
                    <OTPInput 
                        type="number"
                        setValue={onChange}
                        {...rest}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex w-full items-center justify-center">
                <button
                    type="button"
                    className="flex items-center gap-2.5 text-base from-medium text-slate-600
                    transition-colors hover:text-slate-900 duration-200 group"
                    onClick={sendCode}
                    disabled={isCodePending}
                >
                    {isCodePending ? (
                        <Loader2 className="w-6 h-6 text-yellow-600 transition-colors duration-200
                        group-hover:text-primary anmiate-spin" />
                    ): (
                        <RotateCw className="w-6 h-6 text-yellow-600 transition-colors duration-200
                        group-hover:text-primary anmiate-spin" />
                    )}
                    {sendButtontext}
                </button>
            </div>
            <div className="mt-6 flex w-full flex-col gap-4 md:mt-16">
							<Button
								className="flex w-full gap-x-2"
								disabled={isSubmitPending}
							>
								<span className="text-sm uppercase tracking-wider text-inherit">
									{isSubmitPending ? "Verifying..." : "Verify"}
								</span>
								{isSubmitPending ? (
									<Loader2 className="w-4 h-4 shrink-0 animate-spin" />
								) : null}
							</Button>
						</div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default OtpForm;
