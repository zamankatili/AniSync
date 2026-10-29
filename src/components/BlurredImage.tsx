import React from 'react';

interface BlurredImageProps {
  imageUrl: string;
  blurLevel: number; // 0 to 20
  alt: string;
}

export const BlurredImage: React.FC<BlurredImageProps> = ({ imageUrl, blurLevel, alt }) => {
  return (
    <div className="relative overflow-hidden rounded-lg w-full h-64 bg-gray-800">
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover transition-all duration-500 ease-in-out"
        style={{
          filter: `blur(${blurLevel}px)`,
        }}
      />
    </div>
  );
};
