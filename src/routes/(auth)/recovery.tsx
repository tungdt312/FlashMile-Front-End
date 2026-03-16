import {createFileRoute} from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import Recovery from "../../pages/auth/recovery.tsx";

export const Route = createFileRoute('/(auth)/recovery')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SsgoiTransition id={"recovery"}><Recovery/></SsgoiTransition>
}
