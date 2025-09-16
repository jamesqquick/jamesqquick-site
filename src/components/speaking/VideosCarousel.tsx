import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectCoverflow } from "swiper/modules";
import YouTube from "react-youtube";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

interface Video {
  title: string;
  date: string;
  location: string;
  thumbnail: string;
  id: string;
}

interface Props {
  videos: Video[];
}

export default function VideosCarousel({ videos }: Props) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [centerIndex, setCenterIndex] = useState<number>(0);

  const handleSlideChange = (swiper: any) => {
    setCenterIndex(swiper.realIndex);
    setPlayingIndex(null);
  };

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination, EffectCoverflow]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={3}
        loop={true}
        spaceBetween={32}
        // onSlideChange={handleSlideChange}
        onSlideChangeTransitionEnd={handleSlideChange}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 200,
          modifier: 2.5,
          slideShadows: false,
        }}
        pagination={{
          clickable: true,
          renderBullet: function (index, className) {
            return `<span class="${className} !bg-brand !rounded-md !w-4 !h-4"></span>`;
          },
        }}
        navigation={{
          nextEl: ".custom-swiper-next",
          prevEl: ".custom-swiper-prev",
        }}
        className=" pb-10"
        breakpoints={{
          0: { slidesPerView: 1 },
          600: { slidesPerView: 1.1 },
          800: { slidesPerView: 1.3 },
          1024: { slidesPerView: 1.5 },
        }}
      >
        {videos.map((video, idx) => (
          <SwiperSlide
            key={idx}
            className="transition-transform duration-300 pb-10"
          >
            <div className="group flex flex-col items-center">
              <div className="relative w-full pb-[56.25%] rounded-2xl">
                {playingIndex === idx ? (
                  <YouTube
                    videoId={video.id}
                    className="absolute w-full h-full left-0 top-0 rounded-2xl"
                    iframeClassName="w-full h-full rounded-2xl"
                  />
                ) : centerIndex === idx ? (
                  <button
                    className="absolute w-full h-full left-0 top-0"
                    onClick={(e) => {
                      setPlayingIndex(idx);
                    }}
                    aria-label={`Play ${video.title}`}
                  >
                    <button className="custom-swiper-next h-10 w-10 rounded-full bg-white opacity-50 absolute top-1/2 -translate-y-1/2 z-10 -right-16 hover:scale-105 transition-transform">
                      next
                    </button>
                    <button className="custom-swiper-prev h-10 w-10 rounded-full bg-white opacity-50  absolute top-1/2 -translate-y-1/2 z-10 -left-16 hover:scale-105 transition-transform">
                      prev
                    </button>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-6 flex items-center justify-center">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                      >
                        <circle
                          cx="24"
                          cy="24"
                          r="24"
                          fill="#fff"
                          fillOpacity="0.7"
                        />
                        <polygon points="20,16 34,24 20,32" fill="#232646" />
                      </svg>
                    </span>
                  </button>
                ) : (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="absolute w-full h-full object-cover rounded-2xl left-0 top-0"
                  />
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="mt-6 text-center">
        <div className="text-gray-300 text-sm">{videos[centerIndex].date}</div>
        <div className="font-semibold">{videos[centerIndex].title}</div>
        <div className="text-gray-400 text-sm">
          {videos[centerIndex].location}
        </div>
      </div>
    </div>
  );
}
