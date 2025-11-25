import axios from "axios";
import type { BookType, UserType, TradeType } from "./types";
import { useLogin } from "./store";


const API_BASE_URL = 'http://localhost:3030';

const isLoggedAPI = async (): Promise<{ success: boolean, userId?: string }> => {    
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split("=")[1];
        
    if (!token) return { success: false };

    try {
        const result = await axios.get(`${API_BASE_URL}/check`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return { success: result.status === 200, userId: result.data.userId ?? undefined };
    } catch (error) {
        return { success: false };
    }
};

const getUserInfoAPI = async (id: string): Promise<UserType> => {
    const isAuthenticated = useLogin.getState().isAuthenticated;
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split("=")[1];
        
    if (!token || !isAuthenticated) {
        throw new Error('No authentication token found or not authenticated');
    }

    const result = await axios.get(`${API_BASE_URL}/user/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
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

const getBooks = async (page: number = 1): Promise<BooksResponse> => {
    const isAuthenticated = useLogin.getState().isAuthenticated;
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split("=")[1];
        
    if (!token || !isAuthenticated) {
        throw new Error('No authentication token found or not authenticated');
    }

    const result = await axios.get(`${API_BASE_URL}/book?page=${page}&limit=8`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        withCredentials: true
    });
    
    return result.data;
};

const getMyBooks = async (): Promise<BookType[]> => {
    const isAuthenticated = useLogin.getState().isAuthenticated;
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split("=")[1];
        
    if (!token || !isAuthenticated) {
        throw new Error('No authentication token found or not authenticated');
    }

    const result = await axios.get(`${API_BASE_URL}/book/me/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        withCredentials: true
    });
    
    return result.data.data;
};

const login = async (email: string, password: string): Promise<boolean> => {
    const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password
    }, {
        withCredentials: true
    });
    return response.status == 200;
};

const register = async (email: string, username: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/register`, {
        email,
        username,
        password
    }, {
        withCredentials: true
    });

    return response.status == 201;
};

const getMyTrades = async (): Promise<TradeType[]> => {
    const isAuthenticated = useLogin.getState().isAuthenticated;
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split("=")[1];
        
    if (!token || !isAuthenticated) {
        throw new Error('No authentication token found or not authenticated');
    }

    const result = await axios.get(`${API_BASE_URL}/trade/me/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        withCredentials: true
    });
    
    return result.data.data;
};

const addBookAPI = async (name: string, photo: string): Promise<boolean> => {
    const isAuthenticated = useLogin.getState().isAuthenticated;
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split("=")[1];
        
    if (!token || !isAuthenticated) {
        throw new Error('No authentication token found or not authenticated');
    }

    const response = await axios.post<BookType>(`${API_BASE_URL}/book`, {
        name,
        photo
    }, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        withCredentials: true
    });

    return response.status === 201;
};

export { isLoggedAPI, getUserInfoAPI, getBooks, getMyBooks, getMyTrades, login, register, addBookAPI};