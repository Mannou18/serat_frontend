import axiosInstance from './axios.config';

const venteService = {
  // Get all ventes, with optional filters (e.g., customer, page, limit)
  getAllVentes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/ventes${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get a single vente by ID
  getVente: async (id) => {
    const response = await axiosInstance.get(`/ventes/${id}`);
    return response.data;
  },

  // Create a new vente
  createVente: async (data) => {
    const response = await axiosInstance.post('/ventes', data);
    return response.data;
  },

  // Update a vente by ID
  updateVente: async (id, data) => {
    const response = await axiosInstance.put(`/ventes/${id}`, data);
    return response.data;
  },

  // Delete (soft delete) a vente by ID
  deleteVente: async (id) => {
    const response = await axiosInstance.delete(`/ventes/${id}`);
    return response.data;
  },
};

export default venteService; 