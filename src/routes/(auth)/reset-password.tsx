import {createFileRoute} from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import ResetPassword from "../../pages/auth/reset-password.tsx";

export const Route = createFileRoute('/(auth)/reset-password')({
    component: RouteComponent,

})

function RouteComponent() {
    return <SsgoiTransition id={"reset-password"}><ResetPassword/></SsgoiTransition>
}
