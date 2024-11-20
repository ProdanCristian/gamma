"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ProductCarousel({ images, altText }) {
  const [api, setApi] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [thumbnailApi, setThumbnailApi] = useState();

  React.useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setSelectedIndex(api.selectedScrollSnap());
      thumbnailApi?.scrollTo(api.selectedScrollSnap());
    });
  }, [api, thumbnailApi]);

  const handleThumbnailClick = (index) => {
    api?.scrollTo(index);
  };

  return (
    <div className="space-y-4">
      <Carousel
        className="w-full"
        setApi={setApi}
        opts={{
          loop: true,
          align: "start",
        }}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={image.id || index}>
              <Card className="bg-white dark:bg-charade-950 border-gray-200 dark:border-charade-700">
                <CardContent className="p-0">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${image.path}`}
                      alt={`${altText} - ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                      priority={index === 0}
                    />
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 left-2 transform -translate-y-1/2" />
        <CarouselNext className="absolute top-1/2 right-2 transform -translate-y-1/2" />
      </Carousel>

      <Carousel
        setApi={setThumbnailApi}
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {images.map((image, index) => (
            <CarouselItem key={image.id || index} className="basis-1/4 pl-4">
              <button
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "relative w-full aspect-square rounded-md overflow-hidden border transition-all duration-200",
                  selectedIndex === index
                    ? "border-accent dark:border-accent"
                    : "border-transparent hover:border-gray-300 dark:hover:border-charade-600"
                )}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${image.path}`}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 25vw, 10vw"
                  className="object-contain"
                />
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
