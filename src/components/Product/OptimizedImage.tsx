import React, { useState, useRef, useEffect } from 'react';
import { getOptimizedImageUrl, generateResponsiveImageSrcSet, generateImageAlt } from '../../utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt?: string;
  productName?: string;
  imageIndex?: number;
  imageType?: 'main' | 'detail' | 'lifestyle';
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  productName,
  imageIndex = 0,
  imageType = 'main',
  width,
  height,
  className = '',
  lazy = true,
  quality = 80,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized alt text
  const optimizedAlt = alt || (productName ? generateImageAlt(productName, imageIndex, imageType) : '');

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // Generate optimized URLs
  const optimizedSrc = getOptimizedImageUrl(src, { width, height, quality });
  const srcSet = generateResponsiveImageSrcSet(src);

  if (isError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
          <p className="text-sm">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={optimizedAlt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}
    </div>
  );
};

export default OptimizedImage;