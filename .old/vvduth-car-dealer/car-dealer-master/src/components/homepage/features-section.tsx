import { imageSources } from "@/config/constants";
import { imgixLoader } from "@/lib/imgix-loader";

export const FeaturesSection = () => {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-8xl sm:text-center">
          <h2 className="text-base md:text-2xl font-semibold leading-7">
            Yo, we got the hookup!
          </h2>
          <h2 className="mt-2 uppercase text-4xl font-bold tracking-tight text-gray-900 sm:text-8xl">
            Broke? We got you!
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Fresh rides that'll make your neighbors jealous and your ex cry.
            Zero to hero status in 3... 2... 1! 🚗💨
          </p>
        </div>
      </div>
      <div className="relative overflow-hidden pt-16 -mb-16 sm:-mb-24 xl:mb-0">
        <div
          className="mx-auto max-w-7xl h-[300px] bg-cover bg-no-repeat bg-bottom xl:rounded-t-xl shadow-2xl"
          style={{
            backgroundImage: `url(${imgixLoader({ src: imageSources.features, width: 1280, quality: 100 })})`,
          }}
        />
        <div aria-hidden="true" className="relative hidden xl:block">
          <div className="absolute -inset-x-20 bottom-0 bg-linear-to-t from-white to-transparent pt-[3%]" />
        </div>
      </div>
    </div>
  );
};
