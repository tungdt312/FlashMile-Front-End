import {createFileRoute} from '@tanstack/react-router'
import z from "zod";
import {SsgoiTransition} from "@ssgoi/react";
import RolesList from "../../../pages/roles/roles-list.tsx";

const SearchSchema = z.object({
  search: z.string().optional(),
})
export const Route = createFileRoute('/_authenticatedRoute/roles/')({
  component: RouteComponent,
  validateSearch: SearchSchema,
})

function RouteComponent() {
  const {search} = Route.useSearch()
  return <SsgoiTransition id={`/roles`}><RolesList search={search}/></SsgoiTransition>
}
