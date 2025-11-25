import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Profile from "../pages/Profile";
import { isLoggedAPI } from "./api";
import { useLogin } from "./store";
import { Toaster } from "@/components/ui/sonner";

isLoggedAPI().then((result) => {
  const setLogin = useLogin.getState().setLogin;
  setLogin(result.success);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/page/:page" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
