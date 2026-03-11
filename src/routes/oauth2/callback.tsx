import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";
import { OAuth2CallBack } from "../../pages/auth/oauth2-callback";

const callBackSearchSchema = z.object({
    success: z.boolean().optional(),
    data: z.any().optional(),
    error: z.any().optional(),
});

export const Route = createFileRoute("/oauth2/callback")({
    component: RouteComponent,
    validateSearch: (search) => callBackSearchSchema.parse(search),
    beforeLoad: async ({ search }) => {
        // Nếu không có status thì redirect về sign-up do không phải backend gửi callback về
        if (search.success === undefined) {
            throw redirect({
                to: "/sign-up",
                replace: true,
            });
        }
    },
});

function RouteComponent() {
    return <OAuth2CallBack />;
}
