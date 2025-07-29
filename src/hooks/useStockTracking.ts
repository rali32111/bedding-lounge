import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import toast from 'react-hot-toast';

interface StockUpdate {
  productId: string;
  quantityChange: number;
  reason: 'sale' | 'restock' | 'adjustment' | 'return';
  notes?: string;
}

interface StockHistory {
  id: string;
  product_id: string;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string;
  notes?: string;
  created_at: string;
}

export const useStockTracking = () => {
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(false);

  // Update stock quantity
  const updateStock = async (update: StockUpdate): Promise<boolean> => {
    setLoading(true);
    try {
      // Get current product data
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', update.productId)
        .single();

      if (fetchError) throw fetchError;

      const previousQuantity = product.stock_quantity;
      const newQuantity = Math.max(0, previousQuantity + update.quantityChange);

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('id', update.productId);

      if (updateError) throw updateError;

      // Log stock history
      await logStockChange({
        product_id: update.productId,
        quantity_change: update.quantityChange,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        reason: update.reason,
        notes: update.notes
      });

      // Show appropriate notifications
      if (newQuantity === 0) {
        toast.error('⚠️ Product is now out of stock!');
      } else if (newQuantity <= 5 && previousQuantity > 5) {
        toast.error('⚠️ Product stock is running low!');
      } else if (update.reason === 'restock') {
        toast.success('✅ Stock updated successfully');
      }

      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Process order and update stock
  const processOrderStock = async (orderItems: Array<{ product_id: string; quantity: number }>) => {
    setLoading(true);
    try {
      for (const item of orderItems) {
        await updateStock({
          productId: item.product_id,
          quantityChange: -item.quantity,
          reason: 'sale',
          notes: `Order sale - ${item.quantity} units`
        });
      }
      return true;
    } catch (error) {
      console.error('Error processing order stock:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get low stock products
  const getLowStockProducts = async (threshold: number = 5): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lte('stock_quantity', threshold)
        .order('stock_quantity', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return [];
    }
  };

  // Get stock history for a product
  const getStockHistory = async (productId: string): Promise<StockHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('stock_history')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        // If stock_history table doesn't exist, return empty array
        if (error.code === 'PGRST116' || error.message?.includes('relation "stock_history" does not exist')) {
          console.warn('Stock history table not found - returning empty history');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.warn('Error fetching stock history (non-critical):', error);
      return [];
    }
  };

  // Log stock change to history
  const logStockChange = async (change: Omit<StockHistory, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('stock_history')
        .insert([change]);

      if (error) {
        // If stock_history table doesn't exist, log warning but don't fail
        if (error.code === 'PGRST116' || error.message?.includes('relation "stock_history" does not exist')) {
          console.warn('Stock history table not found - skipping history logging');
          return;
        }
        throw error;
      }
    } catch (error) {
      console.warn('Error logging stock change (non-critical):', error);
      // Don't throw error to prevent checkout failure
    }
  };

  // Bulk stock update
  const bulkUpdateStock = async (updates: StockUpdate[]): Promise<boolean> => {
    setLoading(true);
    try {
      for (const update of updates) {
        await updateStock(update);
      }
      toast.success(`✅ Updated stock for ${updates.length} products`);
      return true;
    } catch (error) {
      console.error('Error in bulk stock update:', error);
      toast.error('Failed to update some products');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateStock,
    processOrderStock,
    getLowStockProducts,
    getStockHistory,
    bulkUpdateStock,
    loading
  };
};