import axiosInstance from './axios.config';

const productService = {
  getAllProducts: async (page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get(
        `/product?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllProductsWithQuery: async (queryString) => {
    try {
      const response = await axiosInstance.get(`/product?${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addProduct: async (productData) => {
    try {
      const response = await axiosInstance.post(
        '/product',
        productData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `/product/${id}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  restoreProduct: async (id) => {
    try {
      const response = await axiosInstance.patch(
        `/product/${id}/restore`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getProduct: async (id) => {
    try {
      const response = await axiosInstance.get(`/product/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await axiosInstance.put(`/product/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Gestion des stocks - APIs manquantes
  getLowStockProducts: async () => {
    try {
      const response = await axiosInstance.get('/product/low-stock');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateProductStock: async (id, stockData) => {
    try {
      const response = await axiosInstance.patch(`/product/${id}/stock`, stockData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getStockAlerts: async () => {
    try {
      const response = await axiosInstance.get('/product/stock-alerts');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default productService; 