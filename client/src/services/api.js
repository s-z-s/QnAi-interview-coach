import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to handle errors or headers if needed
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Not authorized, maybe redirect to login or clear state
            // window.location.href = '/login'; // simplified
        }
        return Promise.reject(error);
    }
);

export default api;
