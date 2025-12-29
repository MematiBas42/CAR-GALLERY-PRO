import LocationSection from '@/components/homepage/location-section';
import { ContactForm } from '@/components/contact/contact-form';
import React from 'react';
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SEO");
  return {
    title: t("contact.title"),
    description: t("contact.description"),
  };
}

const ContactPage = async () => {
  const t = await getTranslations("Contact");
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col gap-6">
          <ContactForm />
          
          <Button 
            asChild 
            className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-bold h-12 gap-2 shadow-md"
          >
            <a href="https://wa.me/12532149003" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 fill-current" />
              {t("whatsapp")}
            </a>
          </Button>
        </div>
        <div>
           <LocationSection />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;