import axios from 'axios';

export function createStrapiClient(baseURL, token) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return axios.create({
    baseURL,
    headers,
  });
}






