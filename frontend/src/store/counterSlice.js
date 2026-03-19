import { createSlice } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
  name: "isauthorized",
  initialState: {
    value: false,
  },  
  reducers: {
    increment: (state) => {
      state.value = true;
    },
    decrement: (state) => {
      state.value = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { increment, decrement } = counterSlice.actions;

export default counterSlice.reducer;
