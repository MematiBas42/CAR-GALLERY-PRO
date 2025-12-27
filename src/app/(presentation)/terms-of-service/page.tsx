import React from 'react';
import { getLocale } from "next-intl/server";

const TermsPage = async () => {
  const locale = await getLocale();

  if (locale === 'tr') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-left leading-relaxed">
        <h1 className="text-4xl font-bold mb-8 text-primary">Hizmet Şartları</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <p>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Şartların Kabulü</h2>
            <p>RIM GLOBAL web sitesine erişerek veya siteyi kullanarak, bu Hizmet Şartlarına ve geçerli tüm yasalara bağlı kalmayı kabul etmiş olursunuz.</p>
          </section>
        </div>
      </div>
    );
  }

  if (locale === 'ar') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-right leading-relaxed" dir="rtl">
        <h1 className="text-4xl font-bold mb-8 text-primary">شروط الخدمة</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <p>آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</p>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. الموافقة على الشروط</h2>
            <p>من خلال الدخول إلى موقع RIM GLOBAL أو استخدامه، فإنك توافق على الالتزام بشروط الخدمة هذه وجميع القوانين واللوائح المعمول بها.</p>
          </section>
        </div>
      </div>
    );
  }

  if (locale === 'ko') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-left leading-relaxed">
        <h1 className="text-4xl font-bold mb-8 text-primary">이용 약관</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <p>최종 수정일: {new Date().toLocaleDateString('ko-KR')}</p>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. 약관 동의</h2>
            <p>RIM GLOBAL 웹사이트를 방문하거나 이용함으로써 귀하는 본 이용 약관 및 모든 관련 법규를 준수할 것에 동의하게 됩니다.</p>
          </section>
        </div>
      </div>
    );
  }

  if (locale === 'ru') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-left leading-relaxed">
        <h1 className="text-4xl font-bold mb-8 text-primary">Условия использования</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <p>Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Согласие с условиями</h2>
            <p>Заходя на сайт RIM GLOBAL или используя его, вы соглашаетесь соблюдать настоящие Условия использования и все применимые законы.</p>
          </section>
        </div>
      </div>
    );
  }

  if (locale === 'uk') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-left leading-relaxed">
        <h1 className="text-4xl font-bold mb-8 text-primary">Умови використання</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <p>Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}</p>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Згода з умовами</h2>
            <p>Заходячи на сайт RIM GLOBAL або використовуючи його, ви погоджуєтеся дотримуватися цих Умов використання та всіх відповідних законів.</p>
          </section>
        </div>
      </div>
    );
  }

  if (locale === 'vi') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-left leading-relaxed">
        <h1 className="text-4xl font-bold mb-8 text-primary">Điều khoản Dịch vụ</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <p>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Đồng ý với các Điều khoản</h2>
            <p>Bằng cách truy cập hoặc sử dụng trang web RIM GLOBAL, bạn đồng ý tuân thủ các Điều khoản Dịch vụ này và tất cả các luật và quy định hiện hành.</p>
          </section>
        </div>
      </div>
    );
  }

  if (locale === 'es') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-left leading-relaxed">
        <h1 className="text-4xl font-bold mb-8 text-primary">Términos de Servicio</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <p>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acuerdo de Términos</h2>
            <p>Al acceder o utilizar el sitio web de RIM GLOBAL, usted acepta estar sujeto a estos Términos de Servicio y a todas las leyes y regulaciones aplicables.</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl leading-relaxed">
      <h1 className="text-4xl font-bold mb-8 text-primary">Terms of Service</h1>
      <div className="space-y-6 text-muted-foreground text-lg">
        <p>Last Updated: {new Date().toLocaleDateString('en-US')}</p>
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Agreement to Terms</h2>
          <p>By accessing or using the RIM GLOBAL website, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;