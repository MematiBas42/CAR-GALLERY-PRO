import { getTranslations } from "next-intl/server";

const LocationSection = async () => {
  const t = await getTranslations("Contact");
  return (
    <section className="py-12 bg-secondary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-foreground">{t("title")}</h2>
        <p className="mt-2 text-lg text-muted-foreground">
          {t("description")}
        </p>
        <div className="mt-8 border rounded-lg overflow-hidden">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=-122.322622,47.317323,-122.302622,47.327323&layer=mapnik&marker=47.322323,-122.312622"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
