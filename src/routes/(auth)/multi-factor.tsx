import { createFileRoute } from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import MultiFactor from "../../pages/auth/multi-factor.tsx";
import z from "zod";
const multifactorSearchSchema = z.object({
  method: z.string().optional(),
  t: z.string().optional(),
})
export const Route = createFileRoute('/(auth)/multi-factor')({
  component: RouteComponent,
  validateSearch: multifactorSearchSchema,
})

function RouteComponent() {
  const {method, t} = Route.useSearch()
  return <SsgoiTransition id={"multi-factor"}><MultiFactor method={method} token={t}/></SsgoiTransition>
}
