"use client";
import { OTPSchema, OTPSchemaType } from "@/app/schemas/auth.schema";
import { routes } from "@/config/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import OTPInput from "./otp-input";
import { Button } from "../ui/button";
import { Loader2, RotateCw, LogOut } from "lucide-react";
import { completeChallengeAction, resendChallengeAction } from "@/app/_actions/challenge";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { signOutAction } from "@/app/_actions/sign-out";

interface OtpFormProps {
    email: string;
}

const OtpForm = ({ email }: OtpFormProps) => {
  const t = useTranslations("Auth.otp");
  const [isCodePending, startCodeTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const [sendButtontext, setSendButtontext] = useState(t("resendCode"));
  
  const router = useRouter();
  const form = useForm<OTPSchemaType>({
    resolver: zodResolver(OTPSchema),
  });

  const maskEmail = (emailStr: string) => {
      if (!emailStr) return "";
      const [user, domain] = emailStr.split("@");
      const maskedUser = user.length > 2 ? user.substring(0, 2) + "***" : user + "***";
      return `${maskedUser}@${domain}`;
  };

  const onSubmit: SubmitHandler<OTPSchemaType> = async (data) => {
    startSubmitTransition(async () => {
      const result =  await completeChallengeAction(data.code);
      if (!result?.success) {
        toast.error(t("error"), {
          description: result.message,
        });
        return;
      }
      router.push(routes.admin.dashboard);
    })
  };

  const sendCode = async () => {
    startCodeTransition(async () => {
      const { success, message } = await resendChallengeAction();
      if (!success) {
        toast.error(t("errorSend"),{
          description: message,
        });
        return;
      }
      toast.success(t("success"), {
        description: t("successDesc"),
      })
    });
  }

  useEffect(() => {
    if (isCodePending) {
      setSendButtontext(t("sending"));
    } else {
        setSendButtontext(t("resendCode"));
    }
  },[isCodePending, t])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex w-full flex-1 justify-center px-6 pt-10 lg:items-center lg:pt-0">
      <div className="flex w-full max-w-lg flex-col items-center">
        <h3 className="mb-4 text-3xl md:text-5xl text-center font-bold">
          {t("title")}
        </h3>
        <p className="mb-2 text-center text-muted-foreground">
          {t("description")}
        </p>
        <p className="mb-8 text-center font-medium text-foreground bg-muted py-1 px-4 rounded-full text-sm">
            {maskEmail(email)}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col items-center">
            <FormField
              control={form.control}
              name="code"
              render={({ field: { ref, onChange, ...rest } }) => (
                <FormItem className="mb-6 w-full flex justify-center">
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
            
            <div className="flex w-full items-center justify-center mb-8">
                <button
                    type="button"
                    className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground
                    transition-colors hover:text-foreground duration-200 group"
                    onClick={sendCode}
                    disabled={isCodePending}
                >
                    {isCodePending ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ): (
                        <RotateCw className="w-4 h-4 text-primary group-hover:rotate-180 transition-transform duration-500" />
                    )}
                    {sendButtontext}
                </button>
            </div>

            <div className="flex w-full flex-col gap-4">
                <Button
                    className="w-full gap-x-2"
                    disabled={isSubmitPending}
                    type="submit"
                >
                    <span className="text-sm uppercase tracking-wider">
                        {isSubmitPending ? t("verifying") : t("verify")}
                    </span>
                    {isSubmitPending && <Loader2 className="w-4 h-4 animate-spin" />}
                </Button>
            </div>
          </form>
        </Form>
        
        <div className="w-full mt-4 pt-4 border-t border-muted">
            <form action={signOutAction} className="w-full">
                <Button 
                    variant="ghost" 
                    className="w-full gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    type="submit"
                >
                    <LogOut className="w-4 h-4" />
                    Reset Session & Logout
                </Button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default OtpForm;