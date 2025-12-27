import LocationSection from '@/components/homepage/location-section';
import { ContactForm } from '@/components/contact/contact-form';
import React from 'react';
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SEO");
  return {
    title: t("contact.title"),
    description: t("contact.description"),
  };
}

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <ContactForm />
        </div>
        <div>
           <LocationSection />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;