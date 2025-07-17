import axiosInstance from './axios.config';

const carBrandService = {
  getAllBrandsWithQuery: async (queryString) => {
    try {
      const response = await axiosInstance.get(`/car-brands?${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getBrand: async (id) => {
    try {
      const response = await axiosInstance.get(`/car-brands/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addBrand: async (brandData) => {
    try {
      // Ensure brand_name is not empty and model_names is an array
      if (!brandData.brand_name) {
        throw new Error('Le nom de la marque est requis');
      }
      
      const transformedData = {
        brand_name: brandData.brand_name.trim(),
        model_names: Array.isArray(brandData.model_names) 
          ? brandData.model_names.filter(model => model.trim() !== '')
          : []
      };

      const response = await axiosInstance.post('/car-brands', transformedData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateBrand: async (id, brandData) => {
    try {
      // Ensure brand_name is not empty and model_names is an array
      if (!brandData.brand_name) {
        throw new Error('Le nom de la marque est requis');
      }

      const transformedData = {
        brand_name: brandData.brand_name.trim(),
        model_names: Array.isArray(brandData.model_names) 
          ? brandData.model_names.filter(model => model.trim() !== '')
          : []
      };

      const response = await axiosInstance.put(`/car-brands/${id}`, transformedData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteBrand: async (id) => {
    try {
      const response = await axiosInstance.delete(`/car-brands/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  restoreBrand: async (id) => {
    try {
      const response = await axiosInstance.put(`/car-brands/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default carBrandService; 