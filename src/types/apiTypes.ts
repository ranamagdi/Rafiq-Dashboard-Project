import type {UserMetaData} from "../store/slices/user/userSlice";
export interface Project {
  id?: string;
  name: string;
  description: string;
}

export interface Epic {
  id?: string;
  title: string;
  description: string;
  project_id: string;
  assignee_id?: string;
  deadline?: string;
}

export interface Task {
  id?: string;
  project_id: string;
  epic_id?: string;
  title: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
}
export type ApiResponse<T = unknown> = {
  data: T;
  headers: Headers;
};

export type ApiError = Error & {
    message?: string;
  response?: {
    status: number;
    data: {
      message?: string;
    };
  };
 
};
export type Member = {
  member_id: string;
  project_id: string;
  user_id: string;
  role: string;
  email: string;
  metadata: {
    name?: string;
  };
};
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user_metadata: UserMetaData;
  expires_at: number;
}

export type ApiUser = {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    department?: string;
    email_verified?: boolean;
    phone_verified?: boolean;
  };
};