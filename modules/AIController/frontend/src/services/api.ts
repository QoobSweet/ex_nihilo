import axios from 'axios';

const API_BASE = '/api';

export const chainsAPI = {
  health: async () => {
    try {
      const response = await axios.get(`${API_BASE}/health`);
      return response.data.healthy || true;
    } catch (error) {
      return false;
    }
  },

  getStats: async () => {
    const response = await axios.get(`${API_BASE}/chains/stats`);
    return response.data;
  },

  list: async () => {
    const response = await axios.get(`${API_BASE}/chains`);
    return response.data;
  },

  get: async (id: string | number) => {
    const response = await axios.get(`${API_BASE}/chains/${id}`);
    return response.data;
  },

  create: async (chain: any) => {
    const response = await axios.post(`${API_BASE}/chains`, chain);
    return response.data;
  },

  update: async (id: string | number, chain: any) => {
    const response = await axios.put(`${API_BASE}/chains/${id}`, chain);
    return response.data;
  },

  delete: async (id: string | number) => {
    const response = await axios.delete(`${API_BASE}/chains/${id}`);
    return response.data;
  },

  execute: async (id: string | number, input: any) => {
    const response = await axios.post(`${API_BASE}/chains/${id}/execute`, { input });
    return response.data;
  },

  getExecution: async (executionId: string) => {
    const response = await axios.get(`${API_BASE}/executions/${executionId}`);
    return response.data;
  },

  getChainExecutions: async (chainId: number, limit: number = 50) => {
    const response = await axios.get(`${API_BASE}/chains/${chainId}/executions`, {
      params: { limit }
    });
    return response.data;
  },

  getUserExecutions: async (userId: string, limit: number = 50) => {
    const response = await axios.get(`${API_BASE}/users/${userId}/executions`, {
      params: { limit }
    });
    return response.data;
  },

  listExecutions: async (limit: number = 50) => {
    const response = await axios.get(`${API_BASE}/executions`, {
      params: { limit }
    });
    return response.data;
  }
};
