import {createFileRoute} from '@tanstack/react-router'
import z from "zod";
import {SsgoiTransition} from "@ssgoi/react";
import DepotList from "../../../pages/resources/depot-list.tsx";

const SearchSchema = z.object({
  search: z.string().optional(),
})
export const Route = createFileRoute('/_authenticatedRoute/depot/')({
  component: RouteComponent,
  validateSearch: SearchSchema
})

function RouteComponent() {
  const {search} = Route.useSearch();
  return <SsgoiTransition id={`/depot`}><DepotList search={search}/></SsgoiTransition>
}
