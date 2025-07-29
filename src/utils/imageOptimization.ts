/**
 * Image optimization utilities for better performance and SEO
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
}

/**
 * Generate optimized image URL with parameters
 */
export const getOptimizedImageUrl = (
  originalUrl: string, 
  options: ImageOptimizationOptions = {}
): string => {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    fit = 'cover'
  } = options;

  // If using a CDN service like Cloudinary, ImageKit, or similar
  // Replace this with your CDN's URL transformation logic
  
  // For now, return original URL
  // In production, you would implement CDN transformations here
  return originalUrl;
};

/**
 * Generate responsive image srcset for different screen sizes
 */
export const generateResponsiveImageSrcSet = (
  originalUrl: string,
  sizes: number[] = [400, 600, 800, 1200]
): string => {
  return sizes
    .map(size => `${getOptimizedImageUrl(originalUrl, { width: size })} ${size}w`)
    .join(', ');
};

/**
 * Generate image alt text for SEO
 */
export const generateImageAlt = (
  productName: string,
  imageIndex: number = 0,
  imageType: 'main' | 'detail' | 'lifestyle' = 'main'
): string => {
  const typeDescriptions = {
    main: '',
    detail: ' - Detail View',
    lifestyle: ' - Lifestyle Image'
  };

  const indexSuffix = imageIndex > 0 ? ` ${imageIndex + 1}` : '';
  
  return `${productName}${typeDescriptions[imageType]}${indexSuffix}`;
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please use JPEG, PNG, or WebP images.'
    };
  }

  // Check file size (2MB limit)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please use images smaller than 2MB.'
    };
  }

  return { valid: true };
};

/**
 * Compress image before upload
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate structured data for product images (SEO)
 */
export const generateImageStructuredData = (
  productName: string,
  images: string[],
  productUrl: string
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    image: images,
    url: productUrl,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock'
    }
  };
};

/**
 * Preload critical images for better performance
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Lazy load images with intersection observer
 */
export const setupLazyLoading = (selector: string = 'img[data-src]') => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll(selector).forEach(img => {
      imageObserver.observe(img);
    });
  }
};