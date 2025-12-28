"use client";

import type { Image as PrismaImage } from "@prisma/client";
import FsLightbox from "fslightbox-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useState } from "react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/virtual";
import { EffectFade, Navigation, Thumbs, Virtual } from "swiper/modules";
import { SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import SwiperButton from "../shared/swiper-button";
import { CarouselSkeleton } from "./carousel-skeleton";
import ImgixImage from "../ui/imgix-image";
import { getImageUrl, cn } from "@/lib/utils";

const Swiper = dynamic(() => import("swiper/react").then((mod) => mod.Swiper), {
  ssr: false,
  loading: () => <CarouselSkeleton />,
});

interface ClassifiedCarouselProps {
  images: PrismaImage[];
}
const CarCarousel = ({ images }: ClassifiedCarouselProps) => {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightBoxController, setLightBoxController] = useState({
    toggler: false,
    sourceIndex: 0,
  })
  const setSwiper = (swiper: SwiperType) => {
    setSwiperInstance(swiper);
  };
  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  }, []);
  const handleImageClick = useCallback(() => {
    setLightBoxController({
      toggler: !lightBoxController.toggler,
      sourceIndex: activeIndex,
    });
  }, [lightBoxController.toggler, activeIndex]);
  const sources = images.map((image) => getImageUrl(image.src));
  return (
    <>
    <FsLightbox
				toggler={lightBoxController.toggler}
				sourceIndex={lightBoxController.sourceIndex}
				sources={sources}
				type="image"
			/>
      <div className="relative">
        <Swiper
          onSwiper={setSwiper}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          effect="fade"
          spaceBetween={10}
          fadeEffect={{
            crossFade: true,
          }}
          modules={[Navigation, EffectFade, Virtual]}
          virtual={{
            addSlidesAfter: 8,
            enabled: true,
          }}
          className="apsect-3/2"
          onSlideChange={handleSlideChange}
        >
          {images.map((image, index) => (
            <SwiperSlide key={image.id} virtualIndex={index}>
              <div className="aspect-3/2 relative w-full overflow-hidden rounded-md cursor-pointer" onClick={handleImageClick}>
                <ImgixImage
                blurDataURL={image.blurhash}
                                  placeholder="blur"
                                  src={image.src}
                                  alt={image.alt}
                                  fill={true}
                                  quality={100}
                                  smartCover={true}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <SwiperButton
          prevClassName="left-4 bg-white"
          nextClassName="right-4 bg-white"
        />
      </div>
      
      {/* 4-column centered grid for thumbnails */}
      <div className="grid grid-cols-4 gap-2 mt-4 max-w-2xl mx-auto">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={cn(
                "relative aspect-3/2 cursor-pointer rounded-md overflow-hidden border-2 transition-all",
                activeIndex === index ? "border-primary opacity-100" : "border-transparent opacity-60 hover:opacity-100"
            )}
            onClick={() => {
                swiperInstance?.slideTo(index);
            }}
          >
            <ImgixImage
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              quality={25}
              placeholder="blur"
              blurDataURL={image.blurhash}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default CarCarousel;
