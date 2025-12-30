import { Button } from "../ui/button";
import { Navigation } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

const LocationSection = async () => {
  const t = await getTranslations("Contact");
  const googleMapsUrl = "https://www.google.com/maps/dir/?api=1&destination=47.322323,-122.312622";
  // Free Google Maps Embed URL (No API Key needed)
  const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2703.62342080!2d-122.312622!3d47.322323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDE5JzIwLjQiTiAxMjLCsDE4JzQ1LjQiVw!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus`;

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
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d10814.49257691345!2d-122.312622!3d47.322323!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDE5JzIwLjQiTiAxMjLCsDE4JzQ1LjQiVw!5e0!3m2!1str!2str!4v1703950000000!5m2!1str!2str"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="grayscale hover:grayscale-0 transition-all duration-500"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
