import axios from './axios.config';

const salesService = {
  // Créer une nouvelle vente
  createSale: async (saleData) => {
    try {
      const response = await axios.post('/sales', saleData);
      return response.data;
    } catch (error) {
      // Extract the error message from the backend response
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la création de la vente';
      throw new Error(errorMessage);
    }
  },

  // Obtenir toutes les ventes avec pagination
  getAllSales: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/sales?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des ventes';
      throw new Error(errorMessage);
    }
  },

  // Obtenir toutes les ventes avec filtres
  getAllSalesWithQuery: async (queryString) => {
    try {
      const response = await axios.get(`/sales?${queryString}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des ventes';
      throw new Error(errorMessage);
    }
  },

  // Obtenir une vente par ID
  getSale: async (id) => {
    try {
      const response = await axios.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement de la vente';
      throw new Error(errorMessage);
    }
  },

  // Mettre à jour une vente
  updateSale: async (id, saleData) => {
    try {
      const response = await axios.put(`/sales/${id}`, saleData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour de la vente';
      throw new Error(errorMessage);
    }
  },

  // Supprimer une vente
  deleteSale: async (id) => {
    try {
      const response = await axios.delete(`/sales/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la suppression de la vente';
      throw new Error(errorMessage);
    }
  },

  // Obtenir les ventes d'un client spécifique
  getSalesByCustomer: async (customerId) => {
    try {
      const response = await axios.get(`/sales/customer/${customerId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des ventes du client';
      throw new Error(errorMessage);
    }
  },

  // Obtenir les rapports de ventes
  getSalesReports: async () => {
    try {
      const response = await axios.get('/sales/reports');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des rapports';
      throw new Error(errorMessage);
    }
  }
};

export default salesService; 