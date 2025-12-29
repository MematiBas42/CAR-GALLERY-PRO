"use client";
import { OTPSchema, OTPSchemaType } from "@/app/schemas/auth.schema";
import { routes } from "@/config/routes";
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
import { useTranslations } from "next-intl";

const OtpForm = () => {
  const t = useTranslations("Auth.otp");
  const [isCodePending, startCodeTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();
    const [sendButtontext, setSendButtontext] = useState(t("sendCode"));

  
  const router = useRouter();
  const form = useForm<OTPSchemaType>({
    resolver: zodResolver(OTPSchema),
  });
  const onSubmit: SubmitHandler<OTPSchemaType> = async (data) => {
    startSubmitTransition(async () => {
      // complete OTP action
      const result =  await completeChallengeAction(data.code);
      if (!result?.success) {
        toast.error(t("error"), {
          description: result.message,
        });
        return;
      }
      // Redirect to admin dashboard
      router.push(routes.admin.dashboard);
    })
  };
  const sendCode = async () => {
    startCodeTransition(async () => {
      // Simulate sending code
      
      const {
        success, message
      } = await resendChallengeAction ();
      // Here you would typically call an API to send the OTP code
      setSendButtontext(t("resendCode"));
      if (!success) {
        toast.error(t("errorSend"),{
          description: message,
        });
      }
      toast.success(t("success"), {
        description: t("successDesc"),
      })
    });
  }

  useEffect(() => {
    if (isCodePending) {
      setSendButtontext(t("sending"));
    }
  },[isCodePending, t])
  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex w-full flex-1 justify-center
  px-6 pt-10 lg:items-center lg:pt-0"
    >
      <div className="flex w-full max-w-lg flex-col">
        <h3 className="mb-4 text-4xl md:text-5xl text-center">
          {t("title")}
        </h3>
        <p className="mb-12 text-center text-slate-500 ">
          {t("description")}
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
									{isSubmitPending ? t("verifying") : t("verify")}
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
