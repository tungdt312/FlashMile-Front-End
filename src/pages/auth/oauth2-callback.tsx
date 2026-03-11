import { useNavigate } from "@tanstack/react-router";
import { Route } from "../../routes/oauth2/callback";
import { toast } from "sonner";
import { useRotateToken } from "../../services/authentication/authentication";
import { useAuthStore } from "../../lib/global";
import type { ErrorResponse } from "../../types";
import { useEffect } from "react";

export const OAuth2CallBack = () => {
    const navigate = useNavigate();
    const search = Route.useSearch();
    const authStore = useAuthStore();
    const rotateTokenService = useRotateToken({
        mutation: {
            onSuccess: ({ data }) => {
                if (!data?.accessToken) {
                    toast.error("Can not login with this provider. Please try again.");
                    return;
                }
                authStore.setAccessToken(data.accessToken);
                navigate({ to: "/dashboard", replace: true });
            },
            onError: (err) => {
                const message =
                    err.response?.data.message ||
                    "Can not login with this provider. Please try again.";
                toast.error(`${message}`);
            },
        },
        request: {
            withCredentials: true,
        }
    });

    // chỉ nên cho chạy 1 lần khi component được mount, không nên để search vào dependency array
    useEffect(() => {
        if (search.success === false) {
            // Parse data từ error params, không cần parse lại vì zod đã parse ở validateSearch
            const error = search.error as ErrorResponse;
            const message =
                error.message || "Can not login with this provider. Please try again.";
            toast.error(`${message}`);
            navigate({
                to: "/sign-up",
                replace: true,
                search: () => {
                    return { provider: "google" };
                },
            });
        } else {
            // const data: LoginResult = search.data as LoginResult;
            // TODO: version sau sẽ update tính năng mfa
            // Nếu không bật mfa thì sẽ gọi refreshToken để lấy accessToken
            rotateTokenService.mutate({ data: { refreshToken: "" } });
        }
    }, []);
    return <></>;
};
