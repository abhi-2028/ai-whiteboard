import axios from 'axios';
import { getNeonToken, refreshNeonToken, neonEnabled } from './neonAuth';
import { getSocketId } from './socket';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/api',
});

export function getToken() {
  return neonEnabled ? getNeonToken() : localStorage.getItem('whiteboard_token');
}

export function setToken(token) {
  if (!neonEnabled) localStorage.setItem('whiteboard_token', token);
}

export function clearToken() {
  if (!neonEnabled) localStorage.removeItem('whiteboard_token');
}

api.interceptors.request.use(async (config) => {
  let token = await getToken();
  if (neonEnabled && !token) token = await refreshNeonToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-socket-id'] = getSocketId();
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const request = error.config;
    if (error.response?.status === 401 && request && !request._retry) {
      request._retry = true;
      if (neonEnabled) {
        await refreshNeonToken();
        return api(request);
      }
      clearToken();
      window.location.href = '/login';
    }
    throw new Error(error.response?.data?.error || 'An unexpected error occurred');
  },
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me').then(({ user }) => user),
};

export const userApi = {
  search: (q) => api.get(`/users/search?q=${encodeURIComponent(q)}`).then(({ users }) => users),
};

export const boardApi = {
  list: () => api.get('/whiteboards').then(({ boards }) => boards),
  create: (data) => api.post('/whiteboards', data).then(({ board }) => board),
  get: (id) => api.get(`/whiteboards/${id}`).then(({ board, elements, members }) => ({ board, elements, members })),
  update: (id, data) => api.patch(`/whiteboards/${id}`, data).then(({ board }) => board),
  remove: (id) => api.delete(`/whiteboards/${id}`),
  addMember: (id, userId) => api.post(`/whiteboards/${id}/members`, { userId }).then(({ member }) => member),
  removeMember: (id, userId) => api.delete(`/whiteboards/${id}/members/${userId}`),
};

export const uploadApi = {
  image: (boardId, blob, filename) => {
    const formData = new FormData();
    formData.append('image', blob, filename);
    return api.post(`/whiteboards/${boardId}/uploads`, formData).then(({ url }) => url);
  },
};
