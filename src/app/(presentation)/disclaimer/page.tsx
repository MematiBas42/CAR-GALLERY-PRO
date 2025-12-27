import React from 'react';
import { getLocale } from "next-intl/server";

const DisclaimerPage = async () => {
  const locale = await getLocale();

  if (locale === 'tr') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-left leading-relaxed">
        <h1 className="text-4xl font-bold mb-8 text-primary">Yasal Uyarı</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Fiyatlandırma ve Ücretler</h2>
            <p>Bu web sitesinde gösterilen tüm fiyatlara vergiler, ruhsat ve tescil ücretleri dahil değildir.</p>
          </section>
        </div>
      </div>
    );
  }

  if (locale === 'ar') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-right leading-relaxed" dir="rtl">
        <h1 className="text-4xl font-bold mb-8 text-primary">إخلاء المسؤولية</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">الأسعار والرسوم</h2>
            <p>جميع الأسعار المعروضة على هذا الموقع لا تشمل الضرائب والترخيص ورسوم التسجيل.</p>
          </section>
        </div>
      </div>
    );
  }

  if (locale === 'ko') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-left leading-relaxed">
        <h1 className="text-4xl font-bold mb-8 text-primary">법적 고지</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">가격 및 비용</h2>
            <p>본 웹사이트에 표시된 모든 가격에는 세금, 등록비 등이 포함되어 있지 않습니다.</p>
          </section>
        </div>
      </div>
    );
  }

  if (locale === 'ru') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-left leading-relaxed">
        <h1 className="text-4xl font-bold mb-8 text-primary">Отказ от ответственности</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Цены и сборы</h2>
            <p>Все цены, указанные на этом сайте, не включают налоги, сборы за оформление документов и регистрацию.</p>
          </section>
        </div>
      </div>
    );
  }

  if (locale === 'uk') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-left leading-relaxed">
        <h1 className="text-4xl font-bold mb-8 text-primary">Відмова від відповідальності</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Ціни та збори</h2>
            <p>Усі ціни, вказані на цьому сайті, не включають податки, збори за оформлення документів та реєстрацію.</p>
          </section>
        </div>
      </div>
    );
  }

  if (locale === 'vi') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-left leading-relaxed">
        <h1 className="text-4xl font-bold mb-8 text-primary">Tuyên bố miễn trừ trách nhiệm</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Giá cả và Chi phí</h2>
            <p>Tất cả giá hiển thị trên trang web này không bao gồm thuế, phí cấp biển số và đăng ký. Có thể áp dụng thêm phí dịch vụ tài liệu của đại lý lên đến $200.</p>
          </section>
        </div>
      </div>
    );
  }

  if (locale === 'es') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-left leading-relaxed">
        <h1 className="text-4xl font-bold mb-8 text-primary">Aviso Legal</h1>
        <div className="space-y-6 text-muted-foreground text-lg">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Precios y Tarifas</h2>
            <p>Todos los precios mostrados en este sitio web excluyen impuestos, títulos, licencias y tarifas de registro.</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl leading-relaxed">
      <h1 className="text-4xl font-bold mb-8 text-primary">Disclaimer</h1>
      <div className="space-y-6 text-muted-foreground text-lg">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Pricing and Fees</h2>
          <p>All prices shown on this website exclude taxes, title, license, and registration fees.</p>
        </section>
      </div>
    </div>
  );
};

export default DisclaimerPage;