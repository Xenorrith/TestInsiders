import { create } from "zustand";

interface LoginState {
  isAuthenticated: boolean;
  setLogin: (isAuthenticated: boolean) => void;
}

const useLogin = create<LoginState>((set) => ({
  isAuthenticated: false,
  setLogin: (isAuthenticated: boolean) => set(() => ({ isAuthenticated })),
}));

export { useLogin };

