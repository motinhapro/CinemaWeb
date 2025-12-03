import axios from 'axios';

const api = axios.create({
    // O Docker expõe a porta 3000
    baseURL: 'http://localhost:3000', 
});

export default api;