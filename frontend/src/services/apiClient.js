import axios from 'axios';

/**
 * Standardized API v1 Axios Client
 */
const apiClient = axios.create({
  baseURL: '/api/v1'
});

// Request interceptor to automatically handle FormData content-type headers
apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
