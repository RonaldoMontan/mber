import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearAll } from '../utils/storage';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        clearAll();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${BASE_URL}/api/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access, refresh } = response.data;
        saveTokens(access, refresh);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        
        processQueue(null, access);
        isRefreshing = false;
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        clearAll();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    const apiError: ApiError = {
      message: (error.response?.data as any)?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      data: error.response?.data,
    };

    return Promise.reject(apiError);
  }
);

export const request = {
  get: <T = any>(url: string, config?: any): Promise<T> => 
    axiosInstance.get<T>(url, config) as any,
  
  post: <T = any>(url: string, data?: any, config?: any): Promise<T> => 
    axiosInstance.post<T>(url, data, config) as any,
  
  put: <T = any>(url: string, data?: any, config?: any): Promise<T> => 
    axiosInstance.put<T>(url, data, config) as any,
  
  patch: <T = any>(url: string, data?: any, config?: any): Promise<T> => 
    axiosInstance.patch<T>(url, data, config) as any,
  
  delete: <T = any>(url: string, config?: any): Promise<T> => 
    axiosInstance.delete<T>(url, config) as any,
};

export default request;
