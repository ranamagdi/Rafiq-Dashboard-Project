import { api } from "./api";
import type { Project, Epic, Task, LoginResponse, ApiUser } from "../types/apiTypes";

// SIGN UP
export const signUp = (data: {
  email: string;
  password: string;
  data?: {
    name: string;
    department: string;
  };
}) => {
  return api.post<LoginResponse>("/auth/v1/signup", data);
};

// LOGIN
export const login = (email: string, password: string) =>
  api.post<LoginResponse>("/auth/v1/token?grant_type=password", {
    email,
    password,
  });

// FORGOT PASSWORD
export const forgotPassword = (email: string) => {
  return api.post("/auth/v1/recover", { email });
};

// UPDATE PASSWORD
export const updatePassword = (password: string) => {
  return api.put("/auth/v1/user", { password });
};

// LOGOUT
export const logout = () => {
  return api.post("/auth/v1/logout");
};

// GET USER
export const getUser = () => {
  return api.get<ApiUser>("/auth/v1/user");
};

// REFRESH TOKEN
export const refreshToken = (refresh_token: string) => {
  return api.post("/auth/v1/token?grant_type=refresh_token", {
    refresh_token,
  });
};

export const createProject = (data: { name: string; description: string }) => {
  return api.post("/rest/v1/projects", data);
};

export const getProjects = (limit: number, offset: number) => {
  return api.get(`/rest/v1/rpc/get_projects?limit=${limit}&offset=${offset}`, {
    headers:{ Prefer: "count=exact" },
  });
};
export const getProject = (id: string) => {
  return api.get(`/rest/v1/rpc/get_projects?id=eq.${id}`);
};

export const updateProject = (id: string, data: Partial<Project>) => {
  return api.patch(`/rest/v1/projects?id=eq.${id}`, data);
};

export const createEpic = (data: Partial<Epic>) => {
  return api.post("/rest/v1/epics", data);
};

export const deleteEpic = (id: string) => {
  return api.delete(`/rest/v1/epics?id=eq.${id}`);
};

export const getProjectEpics = (projectId: string, limit: number, offset: number) => {
  return api.get(`/rest/v1/project_epics?project_id=eq.${projectId}&limit=${limit}&offset=${offset}`, {
    headers:{ Prefer: "count=exact" },
  });
};
export const getProjectEpic = (projectId: string,id:string) => {
  return api.get(`/rest/v1/project_epics?project_id=eq.${projectId}&id=eq.${id}`, {
  
  });
};
export const getProjectEpicsSearch = (projectId: string, searchTerm: string) => {
  return api.get(`/rest/v1/project_epics?project_id=eq.${projectId}&title=ilike.%25${(searchTerm)}%25`);
};

export const updateEpic = (id: string, data: Partial<Epic>) => {
  return api.patch(`/rest/v1/epics?id=eq.${id}`, data);
};

export const createTask = (data: Partial<Task>) => {
  return api.post("/rest/v1/tasks", data);
};

export const updateTask = (id: string, data: Partial<Task>) => {
  return api.patch(`/rest/v1/tasks?id=eq.${id}`, data);
};

export const deleteTask = (id: string) => {
  return api.delete(`/rest/v1/tasks?id=eq.${id}`);
};

export const getProjectTasks = (projectId: string) => {
  return api.get(`/rest/v1/project_tasks?project_id=eq.${projectId}`);
};

export const getEpicTasks = (epicId: string) => {
  return api.get(`/rest/v1/project_tasks?epic_id=eq.${epicId}`);
};

export const getProjectMembers = (projectId: string) => {
  return api.get(`/rest/v1/get_project_members?project_id=eq.${projectId}`);
};

export const inviteMember = (data: {
  p_email: string;
  p_project_id: string;
  p_app_url: string;
  p_base_url: string;
}) => {
  return api.post("/rest/v1/rpc/invite_member", data);
};

export const acceptInvitation = (token: string) => {
  return api.post("/rest/v1/rpc/accept_invitation", {
    p_token: token,
  });
};
