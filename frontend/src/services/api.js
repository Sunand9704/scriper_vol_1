import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/properties';

export const fetchProperties = async (params = {}) => {
  try {
    const response = await axios.get(API_BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.warn('Backend API unreachable or offline, using fallback response:', error.message);
    return { success: false, error: error.message };
  }
};

export const fetchPropertyById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const onboardProperty = async (propertyData) => {
  try {
    const response = await axios.post(API_BASE_URL, propertyData);
    return response.data;
  } catch (error) {
    console.error('Error in onboardProperty API:', error);
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, error: 'Network error or backend unavailable.' };
  }
};

export const deleteProperty = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};
