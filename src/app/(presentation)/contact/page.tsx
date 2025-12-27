import LocationSection from '@/components/homepage/location-section';
import { ContactForm } from '@/components/contact/contact-form';
import React from 'react';

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
