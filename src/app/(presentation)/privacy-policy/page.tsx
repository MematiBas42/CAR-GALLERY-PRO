import React from 'react';
import { getLocale } from "next-intl/server";

const PrivacyPolicyPage = async () => {
  const locale = await getLocale();

  if (locale === 'tr') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-primary">Gizlilik Politikası</h1>
        <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
          <p>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Giriş</h2>
            <p>RIM GLOBAL'e hoş geldiniz. Gizliliğinizi korumaya ve web sitemizi kullanırken güvenli bir deneyim yaşamanızı sağlamaya kararlıyız.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Topladığımız Bilgiler</h2>
            <p>Sizden çeşitli yollarla bilgi topluyoruz: Adınız, e-postanız ve site kullanım istatistikleriniz gibi veriler, size daha iyi hizmet sunmak için kullanılır.</p>
          </section>
        </div>
      </div>
    );
  }

  if (locale === 'ko') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-left leading-relaxed">
        <h1 className="text-4xl font-bold mb-8 text-primary">개인정보 처리방침</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <p>최종 수정일: {new Date().toLocaleDateString('ko-KR')}</p>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. 개요</h2>
            <p>RIM GLOBAL에 오신 것을 환영합니다. 당사는 귀하의 개인정보를 보호하고 당사 웹사이트를 이용하는 동안 안전한 경험을 제공하기 위해 최선을 다하고 있습니다.</p>
          </section>
        </div>
      </div>
    );
  }

  // English (Default)
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-primary">Privacy Policy</h1>
      <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
        <p>Last Updated: {new Date().toLocaleDateString('en-US')}</p>
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Introduction</h2>
          <p>Welcome to RIM GLOBAL. We are committed to protecting your privacy and ensuring you have a positive experience on our website. This policy outlines how we handle your personal information to provide you with the best vehicle browsing and financing services.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Data We Collect</h2>
          <p>We collect basic information such as your name, email, and browsing preferences when you interact with our inventory, use our calculators, or contact our Federal Way showroom. This data helps us tailor our automotive offerings to your needs.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Security</h2>
          <p>Your data is stored securely and is only used to facilitate your vehicle purchase or inquiry process. We do not sell your personal information to third parties.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;