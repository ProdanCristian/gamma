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

export default function ProductCarousel({ images }) {
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
              <Card className="bg-white dark:bg-charade-950 border-gray-200 dark:border-charade-700 h-full">
                <CardContent className="flex aspect-square items-center justify-center p-2">
                  <Image
                    src={`${"http://193.160.119.179"}/${image.path}`}
                    alt={image.title || `Product image ${index + 1}`}
                    width={600}
                    height={600}
                    className="object-contain"
                    priority={index === 0}
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 left-2 transform -translate-y-1/2" />
        <CarouselNext className="absolute top-1/2 right-2 transform -translate-y-1/2" />
      </Carousel>

      {/* Thumbnails */}
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
            <CarouselItem key={image.id || index} className="basis-1/4">
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
                  src={`${"http://193.160.119.179"}/${image.path}`}
                  alt={image.title || `Thumbnail ${index + 1}`}
                  width={150}
                  height={150}
                  className="object-cover"
                />
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
