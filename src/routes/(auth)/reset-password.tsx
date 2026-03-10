import {createFileRoute} from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import ResetPassword from "../../pages/auth/reset-password.tsx";
import z from "zod";

const resetPasswordSearchSchema = z.object({
    code: z.string()
})
export const Route = createFileRoute('/(auth)/reset-password')({
    component: RouteComponent,
    validateSearch: resetPasswordSearchSchema,

})

function RouteComponent() {
    const {code} = Route.useSearch()
    return <SsgoiTransition id={"reset-password"}><ResetPassword code={code}/></SsgoiTransition>
}
