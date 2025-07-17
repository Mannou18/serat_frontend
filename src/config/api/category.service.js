import axios from './axios.config';

const getAllCategories = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`/category?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getAllCategoriesWithQuery = async (queryString) => {
  try {
    const response = await axios.get(`/category?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const addCategory = async (categoryData) => {
  try {
    const response = await axios.post('/category', categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`/category/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const restoreCategory = async (id) => {
  try {
    const response = await axios.patch(`/category/${id}/restore`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getCategory = async (id) => {
  try {
    const response = await axios.get(`/category/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const updateCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(`/category/${id}`, categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const categoryService = {
  getAllCategories,
  getAllCategoriesWithQuery,
  addCategory,
  deleteCategory,
  restoreCategory,
  getCategory,
  updateCategory,
};

export default categoryService; 