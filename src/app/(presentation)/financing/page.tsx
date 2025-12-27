import React from 'react';
import { getTranslations } from "next-intl/server";
import { FinancingCalculator } from '@/components/financing/calculator';

const FinancingPage = async () => {
  const t = await getTranslations("Financing");
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>
      
      <FinancingCalculator />
    </div>
  );
};

export default FinancingPage;
