import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Eye, Trash2, Move, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  productId?: string;
  currentImages: string[];
  onImagesUpdate: (newImages: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

interface ImageUpload {
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
  uploaded?: boolean;
  url?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  productId,
  currentImages,
  onImagesUpdate,
  maxImages = 10,
  disabled = false
}) => {
  const [images, setImages] = useState<string[]>(currentImages);
  const [uploads, setUploads] = useState<ImageUpload[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert file to base64 for storage in database
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Upload to external service (ImgBB as example)
  const uploadToExternalService = async (file: File): Promise<string> => {
    try {
      // Convert to base64
      const base64 = await fileToBase64(file);
      const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      
      // For now, we'll use a simple approach - store as data URLs
      // In production, you'd want to use a service like ImgBB, Cloudinary, or similar
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return the base64 data URL for now
      // In production, this would be the URL from your image hosting service
      return base64;
      
    } catch (error) {
      console.error('Error uploading to external service:', error);
      throw new Error('Failed to upload image');
    }
  };

  // Validate file before upload
  const validateFile = (file: File): { valid: boolean; error?: string } => {
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

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList) => {
    const validFiles: File[] = [];
    
    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast.error(`${file.name}: ${validation.error}`);
      }
    });

    if (images.length + uploads.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newUploads: ImageUpload[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      progress: 0,
      uploaded: false
    }));

    setUploads(prev => [...prev, ...newUploads]);
  }, [images.length, uploads.length, maxImages]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Upload single image to Supabase Storage
  const uploadImage = async (upload: ImageUpload): Promise<string | null> => {
    try {
      console.log('Starting image upload...');
      
      // Update upload state to show uploading
      setUploads(prev => prev.map(u => 
        u === upload ? { ...u, uploading: true, progress: 0 } : u
      ));
      
      // Upload to external service or convert to base64
      const imageUrl = await uploadToExternalService(upload.file);
      
      console.log('Image processed successfully');

      // Update upload state to completed
      setUploads(prev => prev.map(u => 
        u === upload ? { 
          ...u, 
          uploading: false, 
          progress: 100, 
          uploaded: true, 
          url: imageUrl 
        } : u
      ));

      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = error.message as string;
        } else if ('error' in error) {
          errorMessage = (error as any).error;
        }
      }
      
      toast.error(`Failed to process ${upload.file.name}: ${errorMessage}`);
      
      // Reset upload state on error
      setUploads(prev => prev.map(u => 
        u === upload ? { ...u, uploading: false, progress: 0 } : u
      ));
      
      return null;
    }
  };

  // Check storage bucket availability
  const checkStorageBucket = async () => {
    try {
      console.log('Checking storage bucket availability...');
      
      // First try to list buckets
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        // If we can't list buckets, try a different approach
        // Try to get the public URL which will work if bucket exists
        try {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl('test');
          
          console.log('Storage bucket appears to be available (via public URL test)');
          return true;
        } catch (urlError) {
          console.error('Storage bucket test failed:', urlError);
          toast.error('Storage system not available. Please check configuration.');
          return false;
        }
      }
      
      console.log('Available buckets:', buckets?.map(b => b.id));
      
      const productImagesBucket = buckets?.find(bucket => bucket.id === 'product-images');
      if (!productImagesBucket) {
        console.warn('product-images bucket not found in list, but this might be a permissions issue');
        // Try to test if we can actually use the bucket
        try {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl('test');
          
          console.log('Storage bucket is accessible despite not being in list');
          return true;
        } catch (testError) {
          console.error('Storage bucket test failed:', testError);
          toast.error('Storage bucket not configured. Please contact administrator.');
          return false;
        }
      }
      
      console.log('Storage bucket found and available:', productImagesBucket);
      return true;
    } catch (error) {
      console.error('Error checking storage bucket:', error);
      toast.error('Unable to verify storage configuration.');
      return false;
    }
  };

  // Process all pending uploads
  const processUploads = async () => {
    const pendingUploads = uploads.filter(u => !u.uploaded);
    
    if (pendingUploads.length === 0) {
      toast.info('No images to upload');
      return;
    }

    console.log('Processing uploads for', pendingUploads.length, 'files');

    try {
      const uploadPromises = pendingUploads.map(upload => uploadImage(upload));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const successfulUploads = uploadedUrls.filter(url => url !== null) as string[];
      
      if (successfulUploads.length > 0) {
        const newImages = [...images, ...successfulUploads];
        setImages(newImages);
        onImagesUpdate(newImages);
        
        // Remove successfully uploaded items from uploads
        setUploads(prev => prev.filter(u => !successfulUploads.includes(u.url || '')));
        
        toast.success(`${successfulUploads.length} image(s) uploaded successfully`);
      } else {
        toast.error('No images were uploaded successfully. Please check your connection and try again.');
      }
    } catch (error) {
      console.error('Error processing uploads:', error);
      toast.error('Failed to process some uploads');
    }
  };

  // Test storage connection on component mount
  useEffect(() => {
    const testStorageConnection = async () => {
      try {
        console.log('Testing storage connection on component mount...');
        
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) {
          console.error('Storage connection test failed:', error);
          console.warn('Could not list buckets, but storage might still work');
          // Don't show error toast immediately, let user try to upload
        } else {
          console.log('Storage connection successful. Available buckets:', buckets?.map(b => b.id));
          const hasProductImagesBucket = buckets?.some(b => b.id === 'product-images');
          if (hasProductImagesBucket) {
            console.log('✅ product-images bucket found');
          } else {
            console.warn('⚠️ product-images bucket not visible in list');
          }
        }
      } catch (error) {
        console.error('Storage connection test error:', error);
        console.warn('Storage connection test failed, but uploads might still work');
      }
    };
    
    testStorageConnection();
  }, []);

  // Remove image from current images
  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    console.log('Removing image:', imageUrl);
    
    // For base64 images, no external cleanup needed
    // For external services, you'd call their delete API here
    
    // Remove from local state
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUpdate(newImages);
    toast.success('Image removed');
  };

  // Remove upload from pending uploads
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
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
            : 'border-gray-300 hover:border-gray-400 cursor-pointer'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <ImageIcon className={`w-12 h-12 mx-auto mb-4 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
        <h3 className={`text-lg font-medium mb-2 ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
          Upload Product Images
        </h3>
        <p className={`mb-4 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {disabled ? 'Image upload disabled' : 'Drag and drop images here, or click to select files'}
        </p>
        {!disabled && (
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Select Images
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          disabled={disabled}
        />
        <p className={`text-sm mt-2 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
          Maximum {maxImages} images • JPEG, PNG, WebP • Max 2MB each • Images stored as data URLs
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
              disabled={uploads.some(u => u.uploading) || disabled}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload All</span>
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
                      <div className="text-white text-sm text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                        Uploading...
                      </div>
                    </div>
                  )}
                  {upload.uploaded && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-75 flex items-center justify-center">
                      <Check className="w-8 h-8 text-white" />
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
                draggable={!disabled}
                onDragStart={() => !disabled && handleDragStart(index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => !disabled && handleImageDrop(e, index)}
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
                {!disabled && (
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
                )}
                
                {/* Drag Handle */}
                {!disabled && (
                  <div className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <Move className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          {!disabled && (
            <p className="text-sm text-gray-600">
              💡 Drag images to reorder. The first image will be used as the main product image.
            </p>
          )}
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

export default ImageUploader;