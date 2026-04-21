import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getUser } from "../../../services/endpoints";
import type { ApiUser } from "../../../types/apiTypes";

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

export const fetchUser = createAsyncThunk<UserMetaData, void>(
  "user/fetchUser",
  async () => {
    const response = await getUser();
    const user: ApiUser = response.data;

    return {
      sub: user.id,
      email: user.email,
      name: user.user_metadata?.name,
      department: user.user_metadata?.department,
      email_verified: user.user_metadata?.email_verified,
      phone_verified: user.user_metadata?.phone_verified,
    };
  }
);
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

  extraReducers: (builder) => {
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.userMetaData = action.payload;
    });
  },
});

export const { setUserMetaData, clearUserMetaData } = userSlice.actions;
export default userSlice.reducer;
