import { createSlice } from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";

interface UserMetaData {
  sub: string;
  name: string;
  email: string;
  department: string;
  email_verified: boolean;
  phone_verified: boolean;
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

    
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    clearUserMetaData: (state) => {
      state.userMetaData = null;

    
      localStorage.removeItem("user");
    },
  },
});

export const { setUserMetaData, clearUserMetaData } = userSlice.actions;
export default userSlice.reducer;