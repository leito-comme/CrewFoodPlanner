import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/auth/jwt';

export const login = async (email: string, password: string) => {
  const data = new URLSearchParams();
  data.append('username', email);
  data.append('password', password);

  return axios.post(`${API_URL}/login`, data, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export const logout = () => {
  localStorage.removeItem('access_token');
};

export const getToken = () => {
  return localStorage.getItem('access_token');
};

export const isAuthenticated = () => {
  return !!getToken();
};
