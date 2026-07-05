import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster
      position="bottom-left"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
      }}
    />
    <App />
  </BrowserRouter>,
);
