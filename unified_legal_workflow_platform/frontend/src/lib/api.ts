import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Matters
export const getMatters = (params?: Record<string, string>) =>
  api.get("/matters/", { params }).then((r) => r.data);

export const getMatter = (id: string) =>
  api.get(`/matters/${id}`).then((r) => r.data);

export const createMatter = (data: Record<string, unknown>) =>
  api.post("/matters/", data).then((r) => r.data);

export const updateMatter = (id: string, data: Record<string, unknown>) =>
  api.patch(`/matters/${id}`, data).then((r) => r.data);

export const getMatterStats = (id: string) =>
  api.get(`/matters/${id}/stats`).then((r) => r.data);

export const getClients = () =>
  api.get("/matters/clients/list").then((r) => r.data);

// Intake
export const submitIntake = (data: Record<string, unknown>) =>
  api.post("/intake/", data).then((r) => r.data);

export const getIntakeQueue = (params?: Record<string, unknown>) =>
  api.get("/intake/queue", { params }).then((r) => r.data);

export const getAllCommunications = (params?: Record<string, unknown>) =>
  api.get("/intake/all", { params }).then((r) => r.data);

export const getCommunication = (id: string) =>
  api.get(`/intake/${id}`).then((r) => r.data);

export const triageCommunication = (id: string, matterId?: string) =>
  api.post(`/intake/${id}/triage`, null, { params: { matter_id: matterId } }).then((r) => r.data);

export const getIntakeStats = () =>
  api.get("/intake/stats/summary").then((r) => r.data);

// Timelines
export const getTimeline = (matterId: string, params?: Record<string, unknown>) =>
  api.get(`/timelines/${matterId}`, { params }).then((r) => r.data);

// Tasks
export const getTasks = (params?: Record<string, unknown>) =>
  api.get("/tasks/", { params }).then((r) => r.data);

export const createTask = (data: Record<string, unknown>) =>
  api.post("/tasks/", data).then((r) => r.data);

export const updateTask = (id: string, data: Record<string, unknown>) =>
  api.patch(`/tasks/${id}`, data).then((r) => r.data);

export const getDeadlines = (params?: Record<string, unknown>) =>
  api.get("/tasks/deadlines/list", { params }).then((r) => r.data);

export const confirmDeadline = (id: string) =>
  api.post(`/tasks/deadlines/${id}/confirm`).then((r) => r.data);

export const dismissDeadline = (id: string) =>
  api.post(`/tasks/deadlines/${id}/dismiss`).then((r) => r.data);

// Knowledge
export const getKnowledge = (params?: Record<string, unknown>) =>
  api.get("/knowledge/", { params }).then((r) => r.data);

export const queryKnowledge = (data: { query: string; matter_id?: string; practice_area?: string }) =>
  api.post("/knowledge/query", data).then((r) => r.data);

export const addKnowledgeItem = (data: Record<string, unknown>) =>
  api.post("/knowledge/", data).then((r) => r.data);

// Audit
export const getAuditLogs = (params?: Record<string, unknown>) =>
  api.get("/audit/logs", { params }).then((r) => r.data);

// Notes
export const getNotes = (matterId: string) =>
  api.get(`/notes/matters/${matterId}`).then((r) => r.data);

export const createNote = (matterId: string, data: { content: string; note_type?: string; created_by?: string }) =>
  api.post(`/notes/matters/${matterId}`, data).then((r) => r.data);

export const deleteNote = (noteId: string) =>
  api.delete(`/notes/${noteId}`).then((r) => r.data);

// Drafts
export const generateDraft = (data: { communication_id: string; tone?: string; matter_context?: string }) =>
  api.post("/drafts/generate", data).then((r) => r.data);

// Connectors
export const getConnectors = () =>
  api.get("/connectors/").then((r) => r.data);

export default api;
