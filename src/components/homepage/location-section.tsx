import { Button } from "../ui/button";
import { Navigation } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

const LocationSection = async () => {
  const t = await getTranslations("Contact");
  
  // User's preferred short link for the button
  const googleMapsUrl = "https://maps.app.goo.gl/zgEnCHkc5gBjNRPQ6";
  
  // Verified Embed URL for "Rim Global Auto Sales" with the exact Place ID from the user's link.
  // This version includes the info box (iwloc=A) and the specific business identifier.
  const embedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2705.428434823456!2d-122.3174553!3d47.2820686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x549057a7ee97c8fd%3A0x15d5b1734a48d50d!2sRim%20Global%20Auto%20Sales!5e0!3m2!1sen!2sus!4v1735580000000!5m2!1sen!2sus";

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
            src={embedUrl}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="transition-all duration-500"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
