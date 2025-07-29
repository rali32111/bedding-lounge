import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  productName, 
  className = '' 
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') setIsZoomed(false);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`aspect-square bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
          <p className="text-sm">No image available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className="relative group">
        <motion.div
          key={selectedImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
        >
          <img
            src={images[selectedImage]}
            alt={`${productName} - Image ${selectedImage + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </motion.div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Zoom Icon */}
        <div className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4" />
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-50 text-white text-sm rounded">
            {selectedImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                selectedImage === index
                  ? 'border-green-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            onClick={() => setIsZoomed(false)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-7xl max-h-7xl p-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[selectedImage]}
                alt={`${productName} - Zoomed view`}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Navigation in zoom mode */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              {/* Close button */}
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full"
              >
                ×
              </button>
              
              {/* Instructions */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded">
                Use arrow keys to navigate • Click outside to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageGallery;