
import axios, { AxiosError, type AxiosRequestConfig } from "axios";

const BACKEND_URL = "https://flashmile-core.onrender.com/";

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

);

axiosInstance.interceptors.response.use(

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