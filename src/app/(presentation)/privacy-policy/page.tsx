import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-primary">Privacy Policy</h1>
      <div className="space-y-6 text-muted-foreground">
        <p>Last Updated: {new Date().toLocaleDateString('en-US')}</p>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Introduction</h2>
          <p>
            Welcome to RIM GLOBAL ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our products and services (collectively, "Services"). This Privacy Policy applies to our website and governs data collection and usage.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
          <p>We collect information from you in various ways, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li><strong>Personal Information:</strong> We may collect personally identifiable information, such as your name, email address, phone number, and mailing address when you fill out contact forms, apply for financing, or subscribe to our newsletter.</li>
            <li><strong>Non-Personal Information:</strong> We automatically collect information about your computer hardware and software. This information can include: your IP address, browser type, domain names, access times, and referring website addresses. This information is used for the operation of the service, to maintain quality of the service, and to provide general statistics regarding use of our website.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Use of Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Process your requests for vehicle information or financing.</li>
            <li>Communicate with you about our products, services, and promotions.</li>
            <li>Improve our website and customer service.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Cookies</h2>
          <p>
            Our website uses "cookies" to help personalize your online experience. A cookie is a text file that is placed on your hard disk by a web page server. Cookies cannot be used to run programs or deliver viruses to your computer. Cookies are uniquely assigned to you, and can only be read by a web server in the domain that issued the cookie to you. You have the ability to accept or decline cookies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Sharing of Information</h2>
          <p>
            We do not sell, rent, or lease our customer lists to third parties. We may share data with trusted partners to help perform statistical analysis, send you email or postal mail, provide customer support, or arrange for deliveries. All such third parties are prohibited from using your personal information except to provide these services to us, and they are required to maintain the confidentiality of your information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Security of Your Personal Information</h2>
          <p>
            We secure your personal information from unauthorized access, use, or disclosure. We use SSL protocol for encryption when transmitting sensitive information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Contact Information</h2>
          <p>
            RIM GLOBAL welcomes your comments regarding this Privacy Policy. If you believe that we have not adhered to this Statement, please contact us at rimglobalwa@gmail.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
