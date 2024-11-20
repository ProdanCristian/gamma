"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ImageCarousel({ sliders }) {
  if (!sliders?.length) return null;

  return (
    <div className="w-full">
      <Carousel className="rounded-lg overflow-hidden">
        <CarouselContent>
          {sliders.map((item, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full max-h-[200px] md:max-h-[350px] lg:max-h-[515px] aspect-square">
                <Image
                  src={item}
                  fill
                  className="object-cover"
                  draggable={false}
                  alt="Slider image"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
