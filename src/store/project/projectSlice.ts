import { createSlice } from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";

type ProjectState = {
  projectId: string | null;
  projectTitle: string | null;
};

const initialState: ProjectState = {
  projectId: null,
  projectTitle: null,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProject(
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) {
      state.projectId = action.payload.id;
      state.projectTitle = action.payload.title;
    },
    clearProject(state) {
      state.projectId = null;
      state.projectTitle = null;
    },
  },
});

export const { setProject, clearProject } = projectSlice.actions;
export default projectSlice.reducer;