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
  assignee_id?: string | null;
  created_at?:string;
  created_by?:{id?:string;name?:string}
  deadline?: string;
  assignee_name?:string;
  assignee_avatar?: string 
}

export type StatusVariant = "TO_DO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id?: string;
  project_id: string;
  epic_id?: string;
  title: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  status: StatusVariant;
}
export type ApiMember = {
  member_id: string;
  project_id: string;
  user_id: string;
  role: string;
  email: string;
  metadata?: {
    name?: string;
    email?: string;
  };
};
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
       code?: string;    
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




export type EpicCardProps = {
  id: string;
  title?: string;
  description?: string;
  createdAt?: string;
  projectId?: string;
  epicId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  status?: StatusVariant;
  createdBy?: string;
  createdByAvatar?: string;
  deadline?: string;
  tasks?: Task[];
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onAddTask?: () => void;
};