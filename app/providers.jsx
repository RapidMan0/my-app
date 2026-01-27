"use client";

import { Provider } from "react-redux";
import { AuthProvider } from "./components/Auth/AuthProvider";
import store from "../store/store";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Provider>
  );
}
