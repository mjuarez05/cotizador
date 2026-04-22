"use client";

import Image from "next/image";
import styles from "./InfiniteCarousel.module.css";

type Props = {
  logos: string[];
  speed?: number;
};

export default function InfiniteCarousel({ logos, speed = 30 }: Props) {
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className={styles.carouselContainer}>
      <div
        className={styles.carouselTrack}
        style={{ animationDuration: `${speed}s` }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div key={index} className={styles.carouselItem}>
            <Image
              src={logo}
              alt={`Sponsor ${index}`}
              width={120}
              height={60}
              className={styles.carouselLogo}
              style={{ height: "60px", width: "auto" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}