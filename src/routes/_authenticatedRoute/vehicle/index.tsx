import {createFileRoute} from '@tanstack/react-router'
import z from "zod";
import {SsgoiTransition} from "@ssgoi/react";
import VehiclesList from "../../../pages/resources/vehicle-list.tsx";

const SearchSchema = z.object({
    search: z.string().optional(),
})

export const Route = createFileRoute('/_authenticatedRoute/vehicle/')({
    component: RouteComponent,
    validateSearch: SearchSchema
})

function RouteComponent() {
    const {search} = Route.useSearch()
    return <SsgoiTransition id={"/vehicle"}><VehiclesList search={search}/></SsgoiTransition>
}
