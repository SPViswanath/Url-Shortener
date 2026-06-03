import API from "./api";

// Fetch all URLs for the logged in user
export const getUserUrls = async () => {
  const response = await API.get("/api/urls");
  return response.data;
};

// Create a new short URL
export const createUrl = async (urlData) => {
  const response = await API.post("/api/urls", urlData);
  return response.data;
};

// Bulk upload short URLs from CSV
export const bulkUploadUrls = async (formData) => {
  const response = await API.post("/api/urls/bulk", formData);
  return response.data;
};

// Update an existing URL
export const updateUrl = async (id, urlData) => {
  const response = await API.put(`/api/urls/${id}`, urlData);
  return response.data;
};

// Delete a URL
export const deleteUrl = async (id) => {
  const response = await API.delete(`/api/urls/${id}`);
  return response.data;
};

// Fetch analytics for a single URL
export const getAnalytics = async (id) => {
  const response = await API.get(`/api/analytics/${id}`);
  return response.data;
};

// Fetch click history (paginated)
export const getClickHistory = async (id, page = 1, limit = 10) => {
  const response = await API.get(`/api/analytics/${id}/clicks?page=${page}&limit=${limit}`);
  return response.data;
};

// Fetch daily clicks for charts
export const getDailyClicks = async (id) => {
  const response = await API.get(`/api/analytics/${id}/daily`);
  return response.data;
};

