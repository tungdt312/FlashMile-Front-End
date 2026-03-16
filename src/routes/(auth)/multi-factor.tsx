import { createFileRoute } from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import MultiFactor from "../../pages/auth/multi-factor.tsx";

export const Route = createFileRoute('/(auth)/multi-factor')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SsgoiTransition id={"multi-factor"}><MultiFactor/></SsgoiTransition>
}
