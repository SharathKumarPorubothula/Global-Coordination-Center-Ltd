import client from './client';

// ---- Auth ----
export const authApi = {
  register: (payload) => client.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => client.post('/auth/login', payload).then((r) => r.data),
  me: () => client.get('/auth/me').then((r) => r.data),
  updateMe: (payload) => client.put('/auth/me', payload).then((r) => r.data),
};

// ---- Jobs ----
export const jobsApi = {
  list: (params) => client.get('/jobs', { params }).then((r) => r.data),
  get: (idOrSlug) => client.get(`/jobs/${idOrSlug}`).then((r) => r.data),
  create: (payload) => client.post('/jobs', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/jobs/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/jobs/${id}`).then((r) => r.data),
  myPostings: () => client.get('/jobs/my/postings').then((r) => r.data),
  toggleSave: (id) => client.post(`/jobs/${id}/save`).then((r) => r.data),
};

// ---- Applications ----
export const applicationsApi = {
  apply: (jobId, payload) => client.post(`/applications/${jobId}`, payload).then((r) => r.data),
  myApplications: () => client.get('/applications/my').then((r) => r.data),
  applicantsForJob: (jobId) => client.get(`/applications/job/${jobId}`).then((r) => r.data),
  updateStatus: (id, payload) => client.patch(`/applications/${id}/status`, payload).then((r) => r.data),
  withdraw: (id) => client.delete(`/applications/${id}`).then((r) => r.data),
};
