import { createFileRoute } from '@tanstack/react-router'
import Setting from "../../pages/user/setting.tsx";
import {SsgoiTransition} from "@ssgoi/react";

export const Route = createFileRoute('/_authenticatedRoute/me')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SsgoiTransition id={"/me"}><Setting/></SsgoiTransition>
}
