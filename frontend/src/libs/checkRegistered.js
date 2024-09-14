import api from './api.js';

export const checkRegistered = async (input, type) => {
  try {
    const response = await api.get(`/check-unique?${type}=${input}`);
    // axios automatically parses the response as JSON if the content type is application/json
    const data = response.data;

    if (data[`${type}_taken`]) {
      return true;
    }
    return false;
  } catch (error) {
    const axiosError = error;
    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(
        `Server responded with status: ${axiosError.response.status}`,
      );
    } else if (axiosError.request) {
      // The request was made but no response was received
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Error in setting up request: ${axiosError.message}`);
    }
  }
};
