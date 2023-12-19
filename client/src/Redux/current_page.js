import { createSlice } from "@reduxjs/toolkit";

export const current_page = createSlice({
  name: "current_page",
  initialState: {
    page_id: "",
    page_name: "",
    members: [],
    role: "",
    server_exists: null,
  },
  reducers: {
    change_page_id: (state, action) => {
      state.page_id = action.payload;
    },
    change_page_name: (state, action) => {
      state.page_name = action.payload;
    },
    server_members: (state, action) => {
      state.members = action.payload;
    },
    server_role: (state, action) => {
      state.role = action.payload;
    },
    server_existence: (state, action) => {
      state.server_exists = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  change_page_id,
  change_page_name,
  server_members,
  server_role,
  server_existence,
} = current_page.actions;

export default current_page.reducer;
