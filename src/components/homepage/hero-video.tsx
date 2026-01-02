"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);

  // Ref callback to ensure muted is set immediately when the node is created
  const setVideoRef = (element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element) {
      element.muted = true;
      element.defaultMuted = true;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = async () => {
      try {
        video.muted = true; // Double check
        await video.play();
        setHasError(false);
      } catch (error) {
        console.warn("Autoplay failed, waiting for interaction:", error);
        setHasError(true);
      }
    };

    attemptPlay();
  }, []);

  // Fallback: Try to play on first interaction if autoplay failed
  useEffect(() => {
    if (!hasError) return;

    const onInteraction = () => {
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.play().catch(e => console.error("Retry play failed:", e));
        setHasError(false);
      }
    };

    window.addEventListener('click', onInteraction, { once: true });
    window.addEventListener('touchstart', onInteraction, { once: true });
    window.addEventListener('keydown', onInteraction, { once: true });

    return () => {
      window.removeEventListener('click', onInteraction);
      window.removeEventListener('touchstart', onInteraction);
      window.removeEventListener('keydown', onInteraction);
    };
  }, [hasError]);

  return (
    <div className="w-full flex justify-center items-center px-4 relative z-0 h-[300px] md:h-[500px] lg:h-[600px] overflow-hidden">
      <video
        ref={setVideoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-auto min-w-full min-h-full max-w-none md:w-full md:h-auto md:min-w-0 md:min-h-0 object-contain pointer-events-none"
        style={{ 
            mixBlendMode: 'normal'
        }}
      >
        <source src="/assets/drift-transparent.webm" type="video/webm" />
      </video>
    </div>
  );
}