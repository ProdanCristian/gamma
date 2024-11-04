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
              <div className="relative w-full h-[250px] md:h-[350px] lg:h-[515px]">
                <Image
                  src={item}
                  fill
                  className="object-cover"
                  draggable={false}
                  alt="Slider image"
                  priority={index === 0}
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
