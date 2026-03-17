import axios from "axios";
import { clearAuthState } from "../store/AuthStore";

const normalizeApiBaseUrl = (url) => {
  if (!url) return "http://localhost:8000/api";

  const trimmed = url.replace(/\/+$/, "");
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/refresh") &&
      !originalRequest?.url?.includes("/auth/signin")
    ) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthState();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
