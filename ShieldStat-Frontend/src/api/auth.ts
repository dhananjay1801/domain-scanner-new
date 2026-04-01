import { apiFetch } from './config';

export interface LoginResponse {
  user_id: string;
  name: string;
  email: string;
  domain: string;
  token: string;
}

export interface RegisterResponse {
  message: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name: string, email: string, password: string, domain: string): Promise<RegisterResponse> => {
    return apiFetch<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, domain }),
    });
  },
};
