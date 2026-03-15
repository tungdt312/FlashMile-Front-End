import type {UserProfileResult} from "../types";
import {create} from "zustand/react";


interface AuthState {
    isAuthenticated: boolean;
    accessToken: string;
    setAccessToken: (accessToken: string) => void;
    clearAccessToken: () => void;
    user: UserProfileResult | undefined;
    setUser: (user: UserProfileResult | undefined) => void;
    clearUser: () => void;
    permissionCodes: string[];
    setPermissionCodes: (codes: string[]) => void;
}

export const useAuthStore = create<AuthState>((set)=> ({
    isAuthenticated: false,
    accessToken: "",
    user: undefined,
    permissionCodes: [],
    setAccessToken: (accessToken: string) => set(() =>({accessToken: accessToken})),
    setUser: (user: UserProfileResult | undefined) => set(() =>({user: user, isAuthenticated: !!user})),
    setPermissionCodes: (codes: string[]) => set(()  => ({permissionCodes: codes})),
    clearUser: () => set(() => ({
        user: undefined,
        isAuthenticated: false,
    })),
    clearAccessToken: () => set(() => ({
        accessToken: "",
    }))
}))