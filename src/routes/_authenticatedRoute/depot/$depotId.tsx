import {createFileRoute} from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import ProvinceDetail from "../../../pages/resources/province-detail.tsx";

export const Route = createFileRoute('/_authenticatedRoute/depot/$depotId')({
    component: RouteComponent,
})

function RouteComponent() {
    const {depotId} = Route.useParams()
    return <SsgoiTransition id={`/depot-detail`}><ProvinceDetail id={depotId}/></SsgoiTransition>
}
