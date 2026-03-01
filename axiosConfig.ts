
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import {
    ACCESS_TOKEN_STORAGE_KEY,
    PUBLIC_ENDPOINTS,
    REFRESH_TOKEN_STORAGE_KEY
} from "./src/constants/securityConstant.ts";
import {rotateToken} from "./src/services/authentication/authentication.ts";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const axiosInstance = axios.create({
    paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((v) => searchParams.append(key, v));
            } else if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        return searchParams.toString();
    },
    baseURL: BACKEND_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
        if (token && !PUBLIC_ENDPOINTS.includes(config.url || "")) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log("Error response:", error.response);
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === 2005 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
            if (refreshToken) {
                try {
                    const data = await rotateToken({ refreshToken });
                    console.log("Refresh token response data:", data);
                    if (data?.data?.accessToken && data?.data?.refreshToken) {
                        const { accessToken, refreshToken: newRefreshToken } = data.data;
                        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
                        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);

                        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                        return axiosInstance(originalRequest);
                    }
                    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
                    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
                    return Promise.reject(error);
                } catch {
                    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
                    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
                    return Promise.reject(error);
                }
            }
        }
        return Promise.reject(error);
    },
);

export const axiosInstanceFn = <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig,
): Promise<T> => {
    const source = axios.CancelToken.source();
    const promise = axiosInstance({
        ...config,
        cancelToken: source.token,
        ...options,
    }).then(({ data }) => data);

    // @ts-expect-error: Property 'cancel' does not exist on type 'Promise<T>'.
    promise.cancel = () => {
        source.cancel("Request canceled");
    };
    return promise;
};

export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<BodyData> = BodyData;
//