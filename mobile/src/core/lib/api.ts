import * as SecureStore from 'expo-secure-store';

export class ApiError {
  name: string;
  message: string;
  code?: string;
  details?: any;

  constructor(message: string, code?: string, details?: any) {
    this.name = 'ApiError';
    this.message = message;
    this.code = code;
    this.details = details;
  }
}

// Tự động phát hiện URL máy chủ API tùy theo môi trường chạy
const getApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return 'http://192.168.51.243:3000';
};

export const API_URL = getApiUrl();

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = await SecureStore.getItemAsync('accessToken');
  
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}
