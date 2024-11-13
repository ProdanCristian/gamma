"use client";

import { useState } from "react";
import Image from "next/image";
import { PiYoutubeLogoFill } from "react-icons/pi";

const YouTubeFacade = ({ videoId, title }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  if (!isLoaded) {
    return (
      <div
        onClick={() => setIsLoaded(true)}
        className="relative pb-[56.25%] h-0 cursor-pointer group"
        role="button"
        aria-label={`Play ${title}`}
      >
        <Image
          src={thumbnailUrl}
          alt={`Thumbnail for ${title}`}
          fill
          className="rounded-lg object-cover group-hover:opacity-90 transition-opacity"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="">
            <PiYoutubeLogoFill
              size={50}
              className="text-red-600  rounded-full flex items-center justify-center group-hover:text-red-700 transition-colors group-hover:scale-110 duration-200"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-[56.25%] h-0">
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default YouTubeFacade;
