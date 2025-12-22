import React from "react";

type AvatarVisualProps = {
  value: string;
  alt: string;
  imgClassName?: string;
  textClassName?: string;
};

const isImageAvatar = (value: string) => {
  if (!value) return false;
  if (/^data:image\//i.test(value)) return true;
  if (/^(https?:)?\/\//i.test(value)) return true;
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(value);
};

export function AvatarVisual({
  value,
  alt,
  imgClassName,
  textClassName,
}: AvatarVisualProps) {
  if (isImageAvatar(value)) {
    return <img src={value} alt={alt} className={imgClassName} />;
  }

  return (
    <span role="img" aria-label={alt} className={textClassName}>
      {value}
    </span>
  );
}
