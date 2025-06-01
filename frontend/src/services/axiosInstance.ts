import axios from "axios";
import { getToken } from "./authService";

const axiosInstance = axios.create({ baseURL: "http://127.0.0.1:8000" });

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
