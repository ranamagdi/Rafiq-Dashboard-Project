import { createSlice } from "@reduxjs/toolkit";

type SliderState = {
  isSidebarOpen: boolean;
};

const initialState: SliderState = {
  isSidebarOpen: false,
};

const sliderSlice = createSlice({
  name: "slider",
  initialState,
  reducers: {
    openSidebar: (state) => {
      state.isSidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
  },
});

export const { openSidebar, closeSidebar, toggleSidebar } = sliderSlice.actions;
export default sliderSlice.reducer;
