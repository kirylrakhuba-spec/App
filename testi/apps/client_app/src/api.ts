import axios from 'axios';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const API_URL = import.meta.env.VITE_API_URL;


if (!API_URL) {
  console.error('create .env file');
}

const api = axios.create({
 baseURL: API_URL, 
 withCredentials: true, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if(token){
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) =>{ Promise.reject(error)}
  )

  api.interceptors.response.use(
    (response) => response,
    async (error) =>{
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
    try{
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

      if(!refreshToken){
        throw new Error('No refresh token');
      }
      const response = await axios.post(`${API_URL}/auth/refresh`, {refreshToken: refreshToken})

      const {accessToken , refreshToken: newRefreshToken} = response.data

      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY,newRefreshToken)

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest)
    }catch(refreshError){
      console.error('Refresh failed', refreshError);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
  }
 )

export default api;