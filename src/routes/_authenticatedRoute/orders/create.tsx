import {createFileRoute} from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import CreateOrder from "../../../pages/orders/create-order.tsx";

export const Route = createFileRoute('/_authenticatedRoute/orders/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SsgoiTransition id={`/orders-create`}><CreateOrder/></SsgoiTransition>
}
