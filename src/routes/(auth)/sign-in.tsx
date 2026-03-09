import {createFileRoute} from '@tanstack/react-router'
import SignIn from "../../pages/auth/sign-in.tsx";
import {SsgoiTransition} from "@ssgoi/react";

export const Route = createFileRoute('/(auth)/sign-in')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SsgoiTransition id={"/sign-in"}><SignIn/></SsgoiTransition>
}
