import { api } from './api';

export const getDashboardSummary = async () => {
  return await api.get('/dashboard/summary');
};

export const getDashboardLines = async () => {
  return await api.get('/dashboard/lines');
};
