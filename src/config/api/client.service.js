import axios from './axios.config';

const getAllClients = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`/customers?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getAllClientsWithQuery = async (queryString) => {
  try {
    const response = await axios.get(`/customers?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const addClient = async (clientData) => {
  try {
    const response = await axios.post('/customers', clientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const deleteClient = async (id) => {
  try {
    const response = await axios.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const restoreClient = async (id) => {
  try {
    const response = await axios.patch(`/customers/${id}/restore`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getClient = async (id) => {
  try {
    const response = await axios.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const updateClient = async (id, clientData) => {
  try {
    const response = await axios.put(`/customers/${id}`, clientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const clientService = {
  getAllClients,
  getAllClientsWithQuery,
  addClient,
  deleteClient,
  restoreClient,
  getClient,
  updateClient,
};

export default clientService; 