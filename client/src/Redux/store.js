import { configureStore } from "@reduxjs/toolkit";
import auth from "./counterSlice";
import options from "./options_slice";
import page from "./current_page";
import user_creds from "./user_creds_slice";

export default configureStore({
  reducer: {
    isauthorized: auth,
    selected_option: options,
    current_page: page,
    user_info: user_creds,
  },
});
