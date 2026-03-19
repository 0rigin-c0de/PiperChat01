import { configureStore } from "@reduxjs/toolkit";
import auth from "./counterSlice";
import options from "./optionsSlice";
import page from "./currentPage";
import user_creds from "./userCredsSlice";
import direct_message from "./directMessageSlice";
import unread from "./unreadSlice";
import presence from "./presenceSlice";

export default configureStore({
  reducer: {
    isauthorized: auth,
    selected_option: options,
    currentPage: page,
    user_info: user_creds,
    direct_message: direct_message,
    unread: unread,
    presence: presence,
  },
});
