
"use client";
import { useTranslations } from "next-intl";

const TestimonialsSection = () => {
    const t = useTranslations("Homepage.Testimonials");
    const testimonials = [
      {
        quote: t("items.0.quote"),
        name: t("items.0.name"),
        location: t("items.0.location")
      },
      {
        quote: t("items.1.quote"),
        name: t("items.1.name"),
        location: t("items.1.location")
      },
      {
        quote: t("items.2.quote"),
        name: t("items.2.name"),
        location: t("items.2.location")
      }
    ];
  
    return (
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground">{t("title")}</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card p-6 rounded-lg shadow-md">
                <p className="text-muted-foreground italic">&quot;{testimonial.quote}&quot;</p>
                <p className="mt-4 font-semibold text-foreground">- {testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default TestimonialsSection;
  