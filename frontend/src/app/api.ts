import axios from "axios";
import type { BookType, UserType, TradeType, TradeStatus } from "./types";
import { useLogin } from "./store";


const API_BASE_URL = 'http://localhost:3030';

const getAuthTokenFromCookie = () =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
    ?.split("=")[1];

const isAuthenticated = () => useLogin.getState().isAuthenticated;

const ensureAuthenticated = () => {
  const token = getAuthTokenFromCookie();
  const authed = isAuthenticated();

  if (!token || !authed) {
    throw new Error("No authentication token found or not authenticated");
  }

  return token;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAuthTokenFromCookie();

  if (token && isAuthenticated()) {
    if (config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    } else {
      config.headers = { Authorization: `Bearer ${token}` } as any;
    }
  }

  return config;
});

const isLoggedAPI = async (): Promise<{ success: boolean; userId?: string }> => {
  const token = getAuthTokenFromCookie();

  if (!token) return { success: false };

  try {
    const result = await api.get("/check");
    return {
      success: result.status === 200,
      userId: result.data.userId ?? undefined,
    };
  } catch {
    return { success: false };
  }
};

const getUserInfoAPI = async (id: string): Promise<UserType> => {
  ensureAuthenticated();

  const result = await api.get(`/user/${id}`);

  return result.data;
};

const getUsersAPI = async (): Promise<UserType[]> => {
  ensureAuthenticated();

  const result = await api.get("/user");

  return result.data;
};

const createUserAPI = async (
  email: string,
  username: string,
  password: string
): Promise<UserType> => {
  ensureAuthenticated();

  const result = await api.post("/user", {
    email,
    username,
    password,
  });

  return result.data;
};

const deleteUserAPI = async (id: string): Promise<boolean> => {
  ensureAuthenticated();

  const response = await api.delete(`/user/${id}`);

  return response.status === 200;
};

const updateProfileAPI = async (
  id: string,
  username: string,
  email: string
): Promise<UserType> => {
  ensureAuthenticated();

  const result = await api.patch(`/user/${id}`, {
    username,
    email,
  });

  return result.data;
};

interface BooksResponse {
    data: BookType[];
    meta: {
        total: number,
        page: number,
        lastPage: number
    }
}

const getBooks = async (page: number = 1, search: string = ""): Promise<BooksResponse> => {
  ensureAuthenticated();

  const result = await api.get("/book", {
    params: { page, limit: 8, search },
  });

  return result.data;
};

const getMyBooks = async (search: string = ""): Promise<BookType[]> => {
  ensureAuthenticated();

  const result = await api.get("/book/me/", {
    params: { search },
  });

  return result.data.data;
};

const login = async (email: string, password: string): Promise<boolean> => {
  const response = await api.post("/login", {
    email,
    password,
  });
  return response.status === 200;
};

const deleteBookAPI = async (id: string): Promise<boolean> => {
  ensureAuthenticated();

  const response = await api.delete(`/book/${id}`);

  return response.status === 200;
};

const register = async (
  email: string,
  username: string,
  password: string
): Promise<boolean> => {
  const response = await api.post("/register", {
    email,
    username,
    password,
  });

  return response.status === 201;
};

const getMyTrades = async (): Promise<TradeType[]> => {
  ensureAuthenticated();

  const result = await api.get("/trade/me/");

  return result.data;
};

const addBookAPI = async (name: string, photo: string): Promise<boolean> => {
  ensureAuthenticated();

  const response = await api.post<BookType>("/book", {
    name,
    photo,
  });

  return response.status === 200;
};

const updateTradeStatusAPI = async (
  id: string,
  status: TradeStatus
): Promise<any> => {
  ensureAuthenticated();

  const response = await api.patch(`/trade/${id}`, {
    status,
  });

  return response.data;
};

const createTradeAPI = async (
  receiverId: string,
  senderBookId: string,
  receiverBookId: string
): Promise<TradeType> => {
  ensureAuthenticated();

  const response = await api.post<TradeType>("/trade", {
    receiverId,
    senderBookId,
    receiverBookId,
  });

  return response.data;
};

export {
  isLoggedAPI,
  getUserInfoAPI,
  getUsersAPI,
  getBooks,
  getMyBooks,
  getMyTrades,
  login,
  register,
  addBookAPI,
  updateTradeStatusAPI,
  createTradeAPI,
  deleteBookAPI,
  createUserAPI,
  deleteUserAPI,
  updateProfileAPI,
};