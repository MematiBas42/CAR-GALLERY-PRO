import { Button } from "../ui/button";
import { Navigation } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

const LocationSection = async () => {
  const t = await getTranslations("Contact");
  const googleMapsUrl = "https://www.google.com/maps/dir/?api=1&destination=47.322323,-122.312622";

  return (
    <section className="py-12 bg-secondary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-foreground">{t("title")}</h2>
        <p className="mt-2 text-lg text-muted-foreground">
          {t("description")}
        </p>
        <div className="mt-8 border rounded-lg overflow-hidden relative group">
          <div className="absolute top-4 right-4 z-10">
            <Button asChild className="bg-white text-black hover:bg-gray-100 shadow-lg gap-2">
                <Link href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="w-4 h-4 fill-current" />
                    {t("getDirections")}
                </Link>
            </Button>
          </div>
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
