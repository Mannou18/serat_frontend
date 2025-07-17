import axiosInstance from './axios.config';

const carService = {
  getAllCars: async (page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get(
        `/cars?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllCarsWithQuery: async (queryString) => {
    try {
      const response = await axiosInstance.get(`/cars?${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addCar: async (carData) => {
    try {
      console.log('Car service - Request payload:', carData);
      const response = await axiosInstance.post(
        '/cars',
        carData
      );
      console.log('Car service - Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Car service - Error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  deleteCar: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `/cars/${id}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  restoreCar: async (id) => {
    try {
      const response = await axiosInstance.patch(
        `/cars/${id}/restore`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCar: async (id) => {
    try {
      const response = await axiosInstance.get(`/cars/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateCar: async (id, carData) => {
    try {
      const response = await axiosInstance.put(`/cars/${id}`, carData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  disassociateCar: async (id) => {
    try {
      const response = await axiosInstance.patch(`/cars/${id}/disassociate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  associateCar: async (carId, customerId) => {
    try {
      const response = await axiosInstance.patch(`/cars/${carId}/associate`, { customerId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default carService; 