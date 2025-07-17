import axios from './axios.config';

const servicesService = {
  // Créer un nouveau service
  createService: async (serviceData) => {
    try {
      const response = await axios.post('/services', serviceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtenir tous les services avec pagination
  getAllServices: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/services?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtenir tous les services avec filtres
  getAllServicesWithQuery: async (queryString) => {
    try {
      const response = await axios.get(`/services?${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtenir un service par ID
  getService: async (id) => {
    try {
      const response = await axios.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mettre à jour un service
  updateService: async (id, serviceData) => {
    try {
      const response = await axios.put(`/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Supprimer un service
  deleteService: async (id) => {
    try {
      const response = await axios.delete(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtenir les services d'un client spécifique
  getServicesByCustomer: async (customerId) => {
    try {
      const response = await axios.get(`/services/customer/${customerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtenir les statistiques des services
  getServicesStats: async () => {
    try {
      const response = await axios.get('/services/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default servicesService; 