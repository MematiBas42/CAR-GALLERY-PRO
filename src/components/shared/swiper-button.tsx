import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import React from "react";

interface SwiperButtonsProps {
  prevClassName?: string;
  nextClassName?: string;
  onPrevClick?: () => void;
  onNextClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}
const SwiperButton = ({
  prevClassName = "swiper-button-prev",
  nextClassName = "swiper-button-next",
  onPrevClick,
  onNextClick,
  onMouseEnter,
  onMouseLeave,
}: SwiperButtonsProps) => {
  return (
    <React.Fragment>
      <Button
        variant="ghost"
        type="button"
        rel="prev"
        size="icon"
        className={cn(
          prevClassName,
          "swiper-button-prev absolute top-1/2 -translate-y-1/2 z-10 flex items-center rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm shadow-md transition-colors h-11 w-11"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onPrevClick?.();
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <ChevronLeft className="h-7 w-7 text-foreground" />
      </Button>
      <Button
        variant="ghost"
        type="button"
        rel="next"
        size="icon"
        className={cn(
          nextClassName,
          "swiper-button-next absolute top-1/2 -translate-y-1/2 z-10 flex items-center rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm shadow-md transition-colors h-11 w-11"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onNextClick?.();
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <ChevronRight className="h-7 w-7 text-foreground" />
      </Button>
    </React.Fragment>
  );
};

export default SwiperButton;
