import axiosInstance from './axios.config';

const serviceService = {
  getAllServices: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/services?page=${page}&limit=${limit}`);
    return response.data;
  },
  getAllServicesWithQuery: async (queryString) => {
    const response = await axiosInstance.get(`/services?${queryString}`);
    return response.data;
  },
  getService: async (id) => {
    const response = await axiosInstance.get(`/services/${id}`);
    return response.data;
  },
  addService: async (data) => {
    const response = await axiosInstance.post('/services', data);
    return response.data;
  },
  updateService: async (id, data) => {
    const response = await axiosInstance.put(`/services/${id}`, data);
    return response.data;
  },
  deleteService: async (id) => {
    const response = await axiosInstance.delete(`/services/${id}`);
    return response.data;
  },
  getServicesByCustomer: async (customerId) => {
    const response = await axiosInstance.get(`/services/customer/${customerId}`);
    return response.data;
  },
};

export default serviceService; 