import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = async (identifier, password) => {
  try {
    const response = await axios.post(`${API_URL}auth/login/`, {
      username: identifier, // Using username field in DRF for either id_number or username
      password: password,
    });
    
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      const decodedToken = jwtDecode(response.data.access);
      
      // Fetch full user profile to obtain role and program mapping
      const userRes = await api.get(`/users/${decodedToken.user_id}/`);
      localStorage.setItem('user_profile', JSON.stringify(userRes.data));
      
      return userRes.data; 
    }
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_profile');
  window.location.href = '/';
};

export const getUserContext = () => {
    const profile = localStorage.getItem('user_profile');
    if (!profile) return null;
    try {
        return JSON.parse(profile);
    } catch {
        return null;
    }
};

export default api;
