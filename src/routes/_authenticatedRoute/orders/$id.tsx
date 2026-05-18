import {createFileRoute} from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import OrderDetailPage from "../../../pages/orders/order-detail.tsx";

export const Route = createFileRoute('/_authenticatedRoute/orders/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const {id} = Route.useParams()
  return <SsgoiTransition id={`/orders-detail`}><OrderDetailPage orderId={id}/></SsgoiTransition>
}
