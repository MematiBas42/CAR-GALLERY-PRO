import React from 'react';

const TermsPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-primary">Terms of Service</h1>
      <div className="space-y-6 text-muted-foreground">
        <p>Last Updated: {new Date().toLocaleDateString('en-US')}</p>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Agreement to Terms</h2>
          <p>
            By accessing or using the RIM GLOBAL website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on RIM GLOBAL's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license, you may not:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Modify or copy the materials;</li>
            <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>Attempt to decompile or reverse engineer any software contained on RIM GLOBAL's website;</li>
            <li>Remove any copyright or other proprietary notations from the materials; or</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Disclaimer</h2>
          <p>
            The materials on RIM GLOBAL's website are provided on an 'as is' basis. RIM GLOBAL makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Limitations</h2>
          <p>
            In no event shall RIM GLOBAL or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on RIM GLOBAL's website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Accuracy of Materials</h2>
          <p>
            The materials appearing on RIM GLOBAL's website could include technical, typographical, or photographic errors. RIM GLOBAL does not warrant that any of the materials on its website are accurate, complete, or current. RIM GLOBAL may make changes to the materials contained on its website at any time without notice. However, RIM GLOBAL does not make any commitment to update the materials.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the State of Washington, USA, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
