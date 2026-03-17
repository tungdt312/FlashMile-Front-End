import { createFileRoute } from '@tanstack/react-router'
import z from "zod";
import {SsgoiTransition} from "@ssgoi/react";
import MultiFactor0 from "../../pages/auth/multi-factor-0.tsx";
const multifactorSearchSchema = z.object({
  methods: z.string().optional(),
  t: z.string().optional(),
})
export const Route = createFileRoute('/(auth)/multi-factor-0')({
  component: RouteComponent,
  validateSearch: multifactorSearchSchema,
})

function RouteComponent() {
  const {methods,t} = Route.useSearch()
  return <SsgoiTransition id={"multi-factor"}><MultiFactor0 methods={methods} token={t}/></SsgoiTransition>
}
