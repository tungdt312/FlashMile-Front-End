import {createFileRoute} from '@tanstack/react-router'
import z from "zod";
import VerifyEmail from "../../pages/auth/verify-email.tsx";
import {SsgoiTransition} from "@ssgoi/react";

const verifyEmailSearchSchema = z.object({
    code: z.string()
})
export const Route = createFileRoute('/(auth)/verify-email')({
    component: RouteComponent,
    validateSearch: verifyEmailSearchSchema,
})

function RouteComponent() {
    const {code} = Route.useSearch()
    return <SsgoiTransition id={`/verify-email`}><VerifyEmail code={code}/></SsgoiTransition>
}
