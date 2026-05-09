import {createFileRoute} from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import z from "zod";
import ContactsList from "../../pages/user/contact-list.tsx";

const SearchSchema = z.object({
  search: z.string().optional(),
})

export const Route = createFileRoute('/_authenticatedRoute/contact-list')({
  component: RouteComponent,
  validateSearch: SearchSchema
})

function RouteComponent() {
  const {search} = Route.useSearch()
  return <SsgoiTransition id={"/contact"}><ContactsList search={search}/></SsgoiTransition>
}
