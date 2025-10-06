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
import { imgixLoader } from "@/lib/imgix-loader";

const Swiper = dynamic(() => import("swiper/react").then((mod) => mod.Swiper), {
  ssr: false,
  loading: () => <CarouselSkeleton />,
});

const SwiperThumb = dynamic(
  () => import("swiper/react").then((mod) => mod.Swiper),
  {
    ssr: false,
    loading: () => null,
  }
);

interface ClassifiedCarouselProps {
  images: PrismaImage[];
}
const CarCarousel = ({ images }: ClassifiedCarouselProps) => {
  const [thumbSwiper, setThumbSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightBoxController, setLightBoxController] = useState({
    toggler: false,
    sourceIndex: 0,
  })
  const setSwiper = (swiper: SwiperType) => {
    setThumbSwiper(swiper);
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
  const sources = images.map((image) => image.src);
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
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          effect="fade"
          spaceBetween={10}
          fadeEffect={{
            crossFade: true,
          }}
          thumbs={{ swiper: thumbSwiper }}
          modules={[Navigation, EffectFade, Thumbs, Virtual]}
          virtual={{
            addSlidesAfter: 8,
            enabled: true,
          }}
          className="apsect-3/2"
          onSlideChange={handleSlideChange}
        >
          {images.map((image, index) => (
            <SwiperSlide key={image.id} virtualIndex={index}>
              <ImgixImage
               blurDataURL={image.blurhash}
								placeholder="blur"
								src={image.src}
								alt={image.alt}
								width={600}
								height={400}
								quality={100}
								className="aspect-3/2 object-cover rounded-md cursor-pointer"
                onClick={handleImageClick}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <SwiperButton
          prevClassName="left-4 bg-white"
          nextClassName="right-4 bg-white"
        />
      </div>
      <SwiperThumb
        onSwiper={setSwiper}
        spaceBetween={10}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[Navigation, Thumbs, EffectFade]}
      >
        {images.map((image) => (
          <SwiperSlide
            className="relative mt-2 h-fit w-full cursor-grab"
            key={image.id}
          >
            <ImgixImage
              className="object-cover aspect-3/2 rounded-md"
              width={150}
              height={100}
              src={image.src}
              alt={image.alt}
              quality={1}
              placeholder="blur"
              blurDataURL={image.blurhash}
            />
          </SwiperSlide>
        ))}
      </SwiperThumb>
    </>
  );
};

export default CarCarousel;
