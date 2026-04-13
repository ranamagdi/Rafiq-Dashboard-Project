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