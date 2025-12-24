"use client";
import { routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect, useRef } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useFormStatus } from "react-dom";
import { CircleCheckIcon, Loader2 } from "lucide-react";
import { SignInAction } from "@/app/_actions/sign-in";
import { useTranslations } from "next-intl";

const SignInButton = () => {
	const t = useTranslations("Auth.signIn");
	const { pending } = useFormStatus();

	return (
		<Button
			disabled={pending}
			type="submit"
			className="w-full uppercase font-bold"
		>
			{pending && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />} {t("button")}
		</Button>
	);
};

const SignInform = () => {
  const t = useTranslations("Auth.signIn");
  const [state, formActions] = useActionState(SignInAction, { success: false, message: "" });
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      // Redirect on success
      window.location.href = routes.admin.dashboard;
    }
  }, [state.success, state.message, router]); // Depend on state.message to re-trigger on new submissions

  return (
    <div className="max-w-md w-full">
      <form
        action={formActions}
        className="border-muted border shadow-lg p-10 rounded-md bg-card"
      >
        <div className="flex items-center mb-6 justify-center">
          <h2 className="uppercase text-2xl font-bold">{t("title")}</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder={t("passwordPlaceholder")}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="my-6 ">
            <p className="text-sm text-muted-foreground mb-2 text-center">
              <b>{t("adminOnly")}</b>
            </p>
          </div>
          <div className="space-y-4">
            <SignInButton />
            {state.message && (
              <div
                className={`flex items-center gap-2 rounded-md p-3 ${state.success ? 'bg-green-600' : 'bg-destructive'} text-primary-foreground`}
              >
                <CircleCheckIcon className="h-5 w-5" />
                <span>{state.message}</span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignInform;