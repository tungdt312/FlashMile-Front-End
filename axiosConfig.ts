import axios, {AxiosError, type AxiosRequestConfig} from "axios";
import {BACKEND_URL, PUBLIC_ENDPOINTS} from "./src/constants/securityConstant.ts";
import {rotateToken} from "./src/services/authentication/authentication.ts";
import {useAuthStore} from "./src/lib/global.ts";

interface FailedRequest {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = []; // Khai báo mảng với kiểu dữ liệu rõ ràng

// 2. Định nghĩa kiểu cho tham số của hàm processQueue
const processQueue = (error: unknown, token: string | null = null): void => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};
const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
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

        // Kiểm tra lỗi 401 và đảm bảo không phải request retry vô hạn
        if (error.response?.status === 401 && !originalRequest._retry) {

            if (isRefreshing) {
                // Nếu đang refresh, tạo một Promise để "treo" request này lại
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers["Authorization"] = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Gọi API rotate token (Server lấy refresh token từ HttpOnly Cookie)
                const data = await rotateToken({ refreshToken: "" });
                const accessToken = data?.data?.accessToken;

                if (accessToken) {
                    useAuthStore.setState({ accessToken: accessToken });

                    // Cập nhật header cho request hiện tại và chạy tiếp
                    originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

                    // Giải phóng hàng đợi cho các request khác đang chờ
                    processQueue(null, accessToken);

                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Nếu refresh thất bại (hết hạn hoàn toàn)
                processQueue(refreshError, null);
                useAuthStore.getState().clearAccessToken();

                // Tránh redirect liên tục nếu đang ở trang chủ
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);
//
// axiosInstance.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config;
//         console.log("Error response:", error.response);
//         if (
//             error.response?.status === 401 &&
//             !originalRequest._retry
//         ) {
//             originalRequest._retry = true;
//             try {
//                 const data = await rotateToken({refreshToken: ""})
//                 console.log("Refresh token response data:", data);
//                 if (data?.data?.accessToken) {
//                     const {accessToken} = data.data;
//                     useAuthStore.setState({accessToken: accessToken});
//                     originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
//                     return axiosInstance(originalRequest);
//                 }
//                 return Promise.reject(error);
//             } catch {
//                 useAuthStore.getState().clearAccessToken()
//                 window.location.href = '/';
//                 return Promise.reject(error);
//             }
//
//         }
//         return Promise.reject(error);
//     },
// );

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