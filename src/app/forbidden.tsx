import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function Forbidden() {
	const t = await getTranslations("Errors.forbidden");
	return (
		<div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
			<h2 className="text-2xl font-bold">{t("title")}</h2>
			<p>{t("description")}</p>
			<Link href="/" className="text-blue-500 hover:underline">{t("returnHome")}</Link>
		</div>
	);
}