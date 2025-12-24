"use client";

import { logoutOfAllSessions } from "@/app/_actions/sign-out";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";

const LogoutButton = () => {
	const t = useTranslations("Admin.settings");
	const { pending } = useFormStatus();

	return (
		<div className="mt-8 flex">
			<Button
				disabled={pending}
				className="flex items-center gap-x-2"
				variant="destructive"
				type="submit"
			>
				{pending && <Loader2 className="animate-spin w-4 h-4" />}
				{pending ? t("loggingOut") : t("logoutButton")}
			</Button>
		</div>
	);
};

export const SettingsPageContent = () => {
	const t = useTranslations("Admin.settings");
	const [_, formAction] = useActionState(logoutOfAllSessions, null);

	return (
		<div className="divide-y divide-white/5 px-6">
			<div className="grid max-w-7xl grid-cols-1 gap-x-8 md:grid-cols-3">
				<div>
					<h2 className="text-base font-semibold leading-7 text-muted">
						{t("logoutTitle")}
					</h2>
					<p className="mt-1 text-sm leading-6 text-muted/75">
						{t("logoutDesc")}
					</p>
				</div>
				<form action={formAction} className="md:col-span-2">
					<LogoutButton />
				</form>
			</div>
		</div>
	);
};