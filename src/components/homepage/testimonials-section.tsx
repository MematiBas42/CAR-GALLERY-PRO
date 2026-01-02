
"use client";
import { useTranslations } from "next-intl";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const TestimonialsSection = () => {
    const t = useTranslations("Homepage.Testimonials");
    const testimonials = [
      {
        quote: t("items.0.quote"),
        name: t("items.0.name"),
        location: t("items.0.location"),
        initials: "AR"
      },
      {
        quote: t("items.1.quote"),
        name: t("items.1.name"),
        location: t("items.1.location"),
        initials: "SB"
      },
      {
        quote: t("items.2.quote"),
        name: t("items.2.name"),
        location: t("items.2.location"),
        initials: "MT"
      },
      // Duplicate for smoother loop if needed, or add more real ones
      {
        quote: "Professional and honest team. They gave me a great price for my trade-in and the process was seamless.",
        name: "David K.",
        location: "Auburn, WA",
        initials: "DK"
      }
    ];
  
    return (
      <section className="pt-16 pb-8 bg-slate-50/80 dark:bg-white/5 relative overflow-hidden border-t border-black/5 dark:border-white/5">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/5 rounded-[100%] blur-3xl -z-10" />

        <div className="container mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-100 mb-6">
                <div className="flex -space-x-1">
                     {[1,2,3,4,5].map(i => (
                         <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                     ))}
                </div>
                <span className="text-sm font-semibold text-gray-900">Trusted by 500+ Customers</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
                {t("title") || "What Our Customers Say"}
            </h2>
            <p className="text-lg text-muted-foreground">
                We pride ourselves on transparency and quality. Here is what our community in Federal Way has to say.
            </p>
          </div>

          {/* Slider */}
          <div className="relative px-4 md:px-0">
             <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={24}
                slidesPerView={1}
                loop={true}
                speed={1000}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                }}
                breakpoints={{
                    640: {
                        slidesPerView: 1,
                    },
                    768: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    },
                }}
                className="pb-12 !px-1"
             >
                {testimonials.map((testimonial, index) => (
                  <SwiperSlide key={index} className="h-auto">
                    <div className="group relative bg-card p-8 rounded-2xl border border-border/50 shadow-lg hover:shadow-2xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full min-h-[320px]">
                        {/* Quote Icon */}
                        <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />

                        {/* Stars */}
                        <div className="flex gap-1 mb-6">
                            {[1,2,3,4,5].map(i => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>

                        {/* Content */}
                        <p className="text-muted-foreground italic leading-relaxed mb-8 flex-grow">
                            &quot;{testimonial.quote}&quot;
                        </p>

                        {/* Author */}
                        <div className="flex items-center gap-4 mt-auto pt-6 border-t border-border/50">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                {testimonial.initials}
                            </div>
                            <div>
                                <p className="font-bold text-foreground text-base">{testimonial.name}</p>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    <span>Verified Buyer • {testimonial.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                  </SwiperSlide>
                ))}
             </Swiper>
          </div>

          {/* Google Badge (Optional / Footer of section) */}
          <div className="mt-8 flex flex-col items-center justify-center grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100 group/google">
             <div className="flex items-center gap-3 mb-2">
                {/* <Image src="/public/logo.svg" alt="Google Reviews" width={24} height={24} className="w-6 h-6" />  */}
                <span className="font-bold text-lg text-foreground">Google Reviews</span>
                <span className="text-muted-foreground">5.0/5.0 Rating</span>
             </div>
             <a 
                href="https://search.google.com/local/reviews?placeid=ChIJ_ciX7qdXkFQRDdVISnOx1RU&q=Rim+Global+Auto+Sales&hl=en&gl=US" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary font-medium underline decoration-dotted underline-offset-4 group-hover/google:text-primary/80 transition-colors"
             >
                 {t("leaveReview") || "Don't forget to leave us a review!"}
             </a>
          </div>
        </div>
      </section>
    );
  };
  
  export default TestimonialsSection;

  