

import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1/', 
  withCredentials:true,
  timeout: 5000,                     
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export {api};