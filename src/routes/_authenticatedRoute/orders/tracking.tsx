import {createFileRoute} from '@tanstack/react-router'
import z from "zod";
import {SsgoiTransition} from "@ssgoi/react";
import Tracking from "../../../pages/orders/tracking.tsx";

const SearchSchema = z.object({
    search: z.string().optional(),
})
export const Route = createFileRoute('/_authenticatedRoute/orders/tracking')({
    component: RouteComponent,
    validateSearch: SearchSchema,
})

function RouteComponent() {
    const {search} = Route.useSearch()
    return <SsgoiTransition id={`/orders-tracking`}><Tracking search={search}/></SsgoiTransition>
}
