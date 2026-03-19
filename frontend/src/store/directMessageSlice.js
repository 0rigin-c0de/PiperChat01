import { createSlice } from "@reduxjs/toolkit";

export const directMessage = createSlice({
  name: "direct_message",
  initialState: {
    activeFriend: null,
  },
  reducers: {
    open_direct_message: (state, action) => {
      state.activeFriend = action.payload;
    },
    close_direct_message: (state) => {
      state.activeFriend = null;
    },
  },
});

export const { open_direct_message, close_direct_message } =
  directMessage.actions;

export default directMessage.reducer;
