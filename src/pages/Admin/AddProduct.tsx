import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import ImageUploader from '../../components/Admin/ImageUploader';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  sku: string;
  weight?: number;
  dimensions?: string;
  care_instructions?: string;
}

const AddProduct: React.FC = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>();

  const categories = [
    { value: 'bedsheets', label: 'Bedsheets' },
    { value: 'duvet-covers', label: 'Duvet Covers' },
    { value: 'pillows', label: 'Pillows' },
    { value: 'blankets', label: 'Blankets' },
  ];

  const handleImagesUpdate = (newImages: string[]) => {
    setImageUrls(newImages);
    console.log('Images updated:', newImages);
  };

  const onSubmit = async (data: ProductFormData) => {
    console.log('Form submission started');
    console.log('Form data:', data);
    console.log('Image URLs:', imageUrls);
    
    setIsSubmitting(true);
    
    try {
      const productData = {
        ...data,
        image_urls: imageUrls,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Submitting product data:', productData);

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Product created successfully:', newProduct);

      toast.success('Product added successfully!');
      reset();
      setImageUrls([]);
      navigate('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to add product: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-2">Add a new product to your bedding store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Product name is required' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Luxury Egyptian Cotton Bedsheet Set"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Detailed product description..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (PKR) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="2499.00"
              />
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                {...register('stock_quantity', { 
                  required: 'Stock quantity is required',
                  min: { value: 0, message: 'Stock must be non-negative' }
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="25"
              />
              {errors.stock_quantity && (
                <p className="text-red-600 text-sm mt-1">{errors.stock_quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                {...register('sku', { required: 'SKU is required' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="BED-COT-Q-WHT"
              />
              {errors.sku && (
                <p className="text-red-600 text-sm mt-1">{errors.sku.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Format: CATEGORY-MATERIAL-SIZE-COLOR (e.g., BED-COT-Q-WHT)
              </p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (grams)
              </label>
              <input
                type="number"
                step="0.1"
                {...register('weight')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="1200.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions
              </label>
              <input
                type="text"
                {...register('dimensions')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder='90" x 108"'
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Care Instructions
              </label>
              <textarea
                {...register('care_instructions')}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Machine wash cold, tumble dry low, do not bleach"
              />
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Images</h2>
          <ImageUploader
            currentImages={imageUrls}
            onImagesUpdate={handleImagesUpdate}
            maxImages={10}
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Add Product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;