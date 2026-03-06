import type {UserProfileResult} from "../types";
import {create} from "zustand/react";


interface AuthState {
    isAuthenticated: boolean;
    accessToken: string;
    setAccessToken: (accessToken: string) => void;
    clearAccessToken: () => void;
    user: UserProfileResult | null;
    setUser: (user: UserProfileResult | null) => void;
    clearUser: () => void;
    permissionCodes: string[];
    setPermissionCodes: (codes: string[]) => void;
}

export const useAuthStore = create<AuthState>((set)=> ({
    isAuthenticated: false,
    accessToken: "",
    user: null,
    permissionCodes: [],
    setAccessToken: (accessToken: string) => set(() =>({accessToken: accessToken})),
    setUser: (user: UserProfileResult | null) => set(() =>({user: user, isAuthenticated: !!user})),
    setPermissionCodes: (codes: string[]) => set(()  => ({permissionCodes: codes})),
    clearUser: () => set(() => ({
        user: null,
        isAuthenticated: false,
    })),
    clearAccessToken: () => set(() => ({
        accessToken: "",
    }))
}))