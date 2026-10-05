import { api } from './api';

export const getLatestAlerts = async () => {
  return await api.get('/alerts/feed/latest');
};

export const getAllAlerts = async (page = 1, limit = 10) => {
  return await api.get('/alerts', { params: { page, limit } });
};
