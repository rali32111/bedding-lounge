import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Eye, Trash2, Move, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ImageManagerProps {
  productId: string;
  currentImages: string[];
  onImagesUpdate: (newImages: string[]) => void;
  maxImages?: number;
}

interface ImageUpload {
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
}

const ImageManager: React.FC<ImageManagerProps> = ({
  productId,
  currentImages,
  onImagesUpdate,
  maxImages = 10
}) => {
  const [images, setImages] = useState<string[]>(currentImages);
  const [uploads, setUploads] = useState<ImageUpload[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 2MB)`);
        return false;
      }
      
      return true;
    });

    if (images.length + uploads.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newUploads: ImageUpload[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      progress: 0
    }));

    setUploads(prev => [...prev, ...newUploads]);
  }, [images.length, uploads.length, maxImages]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Upload image to storage
  const uploadImage = async (upload: ImageUpload): Promise<string | null> => {
    try {
      const fileExt = upload.file.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}.${fileExt}`;
      
      setUploads(prev => prev.map(u => 
        u === upload ? { ...u, uploading: true, progress: 0 } : u
      ));

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, upload.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      setUploads(prev => prev.map(u => 
        u === upload ? { ...u, uploading: false, progress: 100 } : u
      ));

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setUploads(prev => prev.map(u => 
        u === upload ? { ...u, uploading: false, progress: 0 } : u
      ));
      return null;
    }
  };

  // Process all uploads
  const processUploads = async () => {
    const uploadPromises = uploads.map(upload => uploadImage(upload));
    const uploadedUrls = await Promise.all(uploadPromises);
    
    const successfulUploads = uploadedUrls.filter(url => url !== null) as string[];
    const newImages = [...images, ...successfulUploads];
    
    setImages(newImages);
    setUploads([]);
    onImagesUpdate(newImages);
    
    if (successfulUploads.length > 0) {
      toast.success(`${successfulUploads.length} image(s) uploaded successfully`);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUpdate(newImages);
  };

  // Remove upload
  const removeUpload = (upload: ImageUpload) => {
    URL.revokeObjectURL(upload.preview);
    setUploads(prev => prev.filter(u => u !== upload));
  };

  // Reorder images
  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
    onImagesUpdate(newImages);
  };

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Handle drop on image
  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Product Images
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop images here, or click to select files
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Upload className="w-4 h-4 mr-2" />
          Select Images
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        />
        <p className="text-sm text-gray-500 mt-2">
          Maximum {maxImages} images • JPEG, PNG, WebP • Max 2MB each
        </p>
      </div>

      {/* Pending Uploads */}
      {uploads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">
              Pending Uploads ({uploads.length})
            </h4>
            <button
              onClick={processUploads}
              disabled={uploads.some(u => u.uploading)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Upload All
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploads.map((upload, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={upload.preview}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  {upload.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-sm">
                        Uploading... {upload.progress}%
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeUpload(upload)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Images */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Current Images ({images.length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <motion.div
                key={imageUrl}
                layout
                className="relative group cursor-move"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleImageDrop(e, index)}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                      Main
                    </div>
                  )}
                </div>
                
                {/* Image Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    <button
                      onClick={() => setPreviewImage(imageUrl)}
                      className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Drag Handle */}
                <div className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <Move className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
          
          <p className="text-sm text-gray-600">
            💡 Drag images to reorder. The first image will be used as the main product image.
          </p>
        </div>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-4xl max-h-4xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageManager;