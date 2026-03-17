import {createFileRoute} from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import UserDetail from "../../../pages/user/user-detail.tsx";

export const Route = createFileRoute('/_authenticatedRoute/users/$userId')({
  component: RouteComponent,
})

function RouteComponent() {
    const {userId} = Route.useParams()
  return <SsgoiTransition id={`/users/${userId}`}><UserDetail id={userId}/></SsgoiTransition>
}
