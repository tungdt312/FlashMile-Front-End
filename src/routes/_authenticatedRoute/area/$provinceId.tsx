import {createFileRoute} from '@tanstack/react-router'
import z from "zod";
import {SsgoiTransition} from "@ssgoi/react";
import ProvinceDetail from "../../../pages/resources/province-detail.tsx";

const SearchSchema = z.object({
    search: z.string().optional(),
})
export const Route = createFileRoute('/_authenticatedRoute/area/$provinceId')({
    component: RouteComponent,
    validateSearch: SearchSchema,
})

function RouteComponent() {
    const {search} = Route.useSearch()
    const {provinceId} = Route.useParams()
    return <SsgoiTransition id={`/province-detail`}><ProvinceDetail id={provinceId} search={search}/></SsgoiTransition>
}
