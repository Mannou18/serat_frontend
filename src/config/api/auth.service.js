import axios from 'axios';

const API_URL = process.env.BASE_API || 'http://localhost:5000/api';

const login = async (phoneNumber, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      phoneNumber,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      return { token: response.data.token };
    }
    return null;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

const logout = () => {
  localStorage.removeItem('token');
};

const getToken = () => {
  return localStorage.getItem('token');
};

const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Gestion des utilisateurs - APIs manquantes
const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/auth/users?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${API_URL}/auth/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/auth/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

const updateUserRole = async (id, role) => {
  try {
    const response = await axios.patch(`${API_URL}/auth/users/${id}/role`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

const authService = {
  login,
  logout,
  getToken,
  isAuthenticated,
  register,
  getAllUsers,
  updateUser,
  deleteUser,
  updateUserRole
};

export default authService; 