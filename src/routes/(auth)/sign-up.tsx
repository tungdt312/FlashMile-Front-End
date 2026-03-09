import {createFileRoute} from '@tanstack/react-router'
import SignUp from "../../pages/auth/sign-up.tsx";
import {SsgoiTransition} from "@ssgoi/react";

export const Route = createFileRoute('/(auth)/sign-up')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SsgoiTransition id={"/sign-up"}><SignUp/></SsgoiTransition>
}
