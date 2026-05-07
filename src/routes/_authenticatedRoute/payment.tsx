import {createFileRoute} from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import Payment from "../../pages/payment.tsx";

export const Route = createFileRoute('/_authenticatedRoute/payment')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SsgoiTransition id={"/wallet"}><Payment/></SsgoiTransition>
}
