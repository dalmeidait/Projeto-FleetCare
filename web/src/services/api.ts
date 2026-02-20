// web/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  // AQUI: Troque pelo seu IP que aparece no terminal (o Network)
  baseURL: 'http://192.168.15.7:3333' 
});

export { api };