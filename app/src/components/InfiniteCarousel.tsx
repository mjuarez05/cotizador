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
            <div className={styles.logoWrapper}>
              <Image
                src={logo}
                alt={`Sponsor ${index}`}
                fill
                className={styles.carouselLogo}
                sizes="120px"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}