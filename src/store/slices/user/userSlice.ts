import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


export interface UserMetaData {
  sub?: string;
  name?: string;
  email?: string;
  department?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
}

interface UserState {
  userMetaData: UserMetaData | null;
}

const initialState: UserState = {
  userMetaData: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserMetaData: (state, action: PayloadAction<UserMetaData>) => {
      state.userMetaData = action.payload;
    },

    clearUserMetaData: (state) => {
      state.userMetaData = null;
    },
  },
});

export const { setUserMetaData, clearUserMetaData } = userSlice.actions;
export default userSlice.reducer;