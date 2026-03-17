import {createFileRoute} from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import UserList from "../../../pages/user/user-list.tsx";
import z from "zod";

const SearchSchema = z.object({
  search: z.string().optional(),
})
export const Route = createFileRoute('/_authenticatedRoute/users/')({
  component: RouteComponent,
  validateSearch: SearchSchema,
})

function RouteComponent() {
  const {search} = Route.useSearch()
  return <SsgoiTransition id={`/users`}><UserList search={search}/></SsgoiTransition>
}
