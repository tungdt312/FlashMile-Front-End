import {createFileRoute} from '@tanstack/react-router'
import z from "zod";
import {SsgoiTransition} from "@ssgoi/react";
import RoleDetail from "../../../pages/roles/role-detail.tsx";

const SearchSchema = z.object({
    search: z.string().optional(),
})
export const Route = createFileRoute('/_authenticatedRoute/roles/$roleId')({
    component: RouteComponent, validateSearch: SearchSchema,
})

function RouteComponent() {
    const {roleId} = Route.useParams()
    const {search} = Route.useSearch()
    return <SsgoiTransition id={`/permission`}><RoleDetail id={roleId} search={search || ""}/></SsgoiTransition>
}
