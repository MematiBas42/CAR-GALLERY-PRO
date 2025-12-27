import React from 'react';

const DisclaimerPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-primary">Disclaimer</h1>
      <div className="space-y-6 text-muted-foreground">
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Pricing and Fees</h2>
          <p>
            All prices shown on this website exclude taxes, title, license, and registration fees. A dealer documentary service fee of up to $200 may be added to the sale price or capitalized cost. Prices are subject to change without notice. Please contact us directly for the most accurate and up-to-date pricing information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Vehicle Information</h2>
          <p>
            While we make every effort to ensure the accuracy of the information on this website, errors may occur. We are not responsible for typographical errors or omissions. Vehicle availability, mileage, equipment, and features are subject to change. Please verify all information with a RIM GLOBAL representative before purchasing.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">"As-Is" Sale</h2>
          <p>
            Unless otherwise stated in writing, all used vehicles are sold "AS-IS" and without warranty, either express or implied. The purchaser will bear the entire expense of repairing or correcting any defects that may exist at the time of sale or develop thereafter. Some vehicles may still be covered by the remainder of the manufacturer's factory warranty.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Financing Estimations</h2>
          <p>
            The payment calculator and financing tools provided on this website are for estimation purposes only. Actual monthly payments, down payments, and interest rates may vary based on your credit history, the specific vehicle, and lender criteria. These estimates do not constitute a financing offer or guarantee of credit approval.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Third-Party Links</h2>
          <p>
            This website may contain links to third-party websites. RIM GLOBAL is not responsible for the content, privacy policies, or practices of such websites.
          </p>
        </section>

      </div>
    </div>
  );
};

export default DisclaimerPage;
