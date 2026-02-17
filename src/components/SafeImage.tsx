// components/SafeImage.tsx
"use client";

import Image from "next/image";
import React from "react";

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  style?: React.CSSProperties;
};

export default function SafeImage({ src, alt = "", className = "", width, height, fill = false, style }: Props) {
  const safe = src || "/images/meal-placeholder.jpg";
  const isData = typeof safe === "string" && safe.startsWith("data:");
  const isBlob = typeof safe === "string" && safe.startsWith("blob:");

  if (isData || isBlob) {
    // plain img works fine for data URLs and blobs
    return <img src={safe} alt={alt} className={className} style={style} />;
  }

  // remote url or absolute path — use next/image but disable optimization to avoid domain config during dev
  // In production you should list allowed domains in next.config.js and remove `unoptimized`
  if (fill) {
    // when using layout="fill" equivalent in the app dir we pass fill prop to Image
    return (
      // @ts-ignore `fill` typing with unoptimized sometimes complains, ignore in dev
      <Image src={safe} alt={alt} className={className} fill unoptimized style={style} />
    );
  }

  return <Image src={safe} alt={alt} className={className} width={width} height={height} unoptimized style={style} />;
}