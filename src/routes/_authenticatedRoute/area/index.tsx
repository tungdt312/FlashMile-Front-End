import {createFileRoute} from '@tanstack/react-router'
import z from "zod";
import {SsgoiTransition} from "@ssgoi/react";
import AreaList from "../../../pages/resources/area-list.tsx";

const SearchSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
})
export const Route = createFileRoute('/_authenticatedRoute/area/')({
  component: RouteComponent,
  validateSearch: SearchSchema,
})

function RouteComponent() {
  const {search, type} = Route.useSearch()
  return <SsgoiTransition id={`/area`}><AreaList search={search} type={type || "province"}/></SsgoiTransition>
}
