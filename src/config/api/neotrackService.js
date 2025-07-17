import axios from './axios.config';

const neotrackService = {
  getNeotracks: () => axios.get('/neotracks'),
  getNeotrack: (id) => axios.get(`/neotracks/${id}`),
  addNeotrack: (data) => axios.post('/neotracks', data),
  updateNeotrack: (id, data) => axios.put(`/neotracks/${id}`, data),
  deleteNeotrack: (id) => axios.delete(`/neotracks/${id}`),
  getCustomers: () => axios.get('/customers'),
  getUsers: () => axios.get('/users'),
};

export default neotrackService; 