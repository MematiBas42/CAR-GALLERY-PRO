import React from 'react';
import { getTranslations } from "next-intl/server";

const OurPhilosophyPage = async () => {
  const t = await getTranslations("Philosophy");
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
      <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-600 text-left">
        <p>
          <span className="font-bold text-primary">{t("curation.title")}</span> {t("curation.description")}
        </p>
        <p>
          <span className="font-bold text-primary">{t("transparency.title")}</span> {t("transparency.description")}
        </p>
        <p>
          <span className="font-bold text-primary">{t("partnership.title")}</span> {t("partnership.description")}
        </p>
      </div>
    </div>
  );
};

export default OurPhilosophyPage;
