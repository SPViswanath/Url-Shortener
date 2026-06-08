/**
 * api.js
 * 
 * Configures the base Axios instance for making HTTP requests.
 * Sets the base URL and ensures cookies (credentials) are sent with every request.
 */
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export default API;
