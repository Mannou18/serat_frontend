import axiosInstance from './axios.config';

const installmentService = {
  // Get upcoming installments for dashboard
  getUpcomingInstallments: async (params = {}) => {
    const { page = 1, limit = 20, daysAhead = 30 } = params;
    const queryString = new URLSearchParams({
      page,
      limit,
      daysAhead
    }).toString();
    
    const response = await axiosInstance.get(`/installments/dashboard/upcoming?${queryString}`);
    return response.data;
  },

  // Get installments for a specific customer
  getCustomerInstallments: async (customerId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/installments/customer/${customerId}${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Get upcoming installments for a specific customer
  getCustomerUpcomingInstallments: async (customerId, params = {}) => {
    const { daysAhead = 30 } = params;
    const queryString = new URLSearchParams({
      daysAhead
    }).toString();
    
    const response = await axiosInstance.get(`/installments/client/${customerId}/upcoming?${queryString}`);
    return response.data;
  },

  // Update installment status
  updateInstallmentStatus: async (installmentId, status) => {
    const response = await axiosInstance.put(`/installments/${installmentId}/status`, { status });
    return response.data;
  },

  // Mark installment as paid
  markInstallmentAsPaid: async (installmentId, paymentData = {}) => {
    const response = await axiosInstance.put(`/installments/${installmentId}/paid`, paymentData);
    return response.data;
  },
};

export default installmentService; 