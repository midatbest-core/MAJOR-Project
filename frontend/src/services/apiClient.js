import axios from 'axios';

/**
 * Standardized API v1 Axios Client
 */
const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;
