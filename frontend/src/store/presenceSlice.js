import { createSlice } from "@reduxjs/toolkit";

const presenceSlice = createSlice({
  name: "presence",
  initialState: {
    byId: {},
  },
  reducers: {
    set_online_users: (state, action) => {
      const nextState = {};

      (action.payload || []).forEach((userId) => {
        nextState[String(userId)] = true;
      });

      state.byId = nextState;
    },
    set_user_presence: (state, action) => {
      const { user_id, online } = action.payload;

      if (!user_id) {
        return;
      }

      if (online) {
        state.byId[String(user_id)] = true;
        return;
      }

      delete state.byId[String(user_id)];
    },
  },
});

export const { set_online_users, set_user_presence } = presenceSlice.actions;

export default presenceSlice.reducer;
