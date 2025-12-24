import { getTranslations } from "next-intl/server";

export const FeaturesSection = async () => {
  const t = await getTranslations("Homepage.Features");
  return (
    <div className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-8xl text-center">
          <h2 className="text-base md:text-2xl font-semibold leading-7">
            {t("trust")}
          </h2>
          <h2 className="mt-2 uppercase text-4xl font-bold tracking-tight text-foreground sm:text-8xl">
            {t("financing")}
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>
      <div className="relative overflow-hidden pt-16 -mb-16 sm:-mb-24 xl:mb-0">
        <div
          className="mx-auto max-w-7xl h-[300px] bg-cover bg-no-repeat bg-bottom xl:rounded-t-xl shadow-2xl"
          style={{
            backgroundImage: `url('/assets/financing-bg.jpg')`,
          }}
        />
        <div aria-hidden="true" className="relative hidden xl:block">
          <div className="absolute -inset-x-20 bottom-0 bg-linear-to-t from-background to-transparent pt-[3%]" />
        </div>
      </div>
    </div>
  );
};
