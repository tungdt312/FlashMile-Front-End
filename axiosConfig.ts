import axios, {AxiosError, type AxiosRequestConfig} from "axios";
import {BACKEND_URL, PUBLIC_ENDPOINTS} from "./src/constants/securityConstant.ts";
import {rotateToken} from "./src/services/authentication/authentication.ts";
import {useAuthStore} from "./src/lib/global.ts";


const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        console.log(token);
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
            try {
                const data = await rotateToken({refreshToken: ""});
                console.log("Refresh token response data:", data);
                if (data?.data?.accessToken) {
                    const {accessToken} = data.data;
                    useAuthStore.setState({accessToken: accessToken});
                    originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                    return axiosInstance(originalRequest);
                }
                useAuthStore.getState().clearAccessToken()
                return Promise.reject(error);
            } catch {
                useAuthStore.getState().clearAccessToken()
                return Promise.reject(error);
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
    }).then(({data}) => data);

    // @ts-expect-error: Property 'cancel' does not exist on type 'Promise<T>'.
    promise.cancel = () => {
        source.cancel("Request canceled");
    };
    return promise;
};

export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<BodyData> = BodyData;
//