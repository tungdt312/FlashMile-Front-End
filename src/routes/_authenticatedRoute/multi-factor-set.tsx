import { createFileRoute } from '@tanstack/react-router'
import z from "zod";
import MultiFactorSet from "../../pages/user/multi-factor-set.tsx";
import {SsgoiTransition} from "@ssgoi/react";
const multifactorSearchSchema = z.object({
  step: z.number().optional(),
})
export const Route = createFileRoute('/_authenticatedRoute/multi-factor-set')({
  component: RouteComponent,
  validateSearch: multifactorSearchSchema
})

function RouteComponent() {
  const {step} = Route.useSearch();
  return <SsgoiTransition id={"/multi-factor-set"}><MultiFactorSet step={step}/></SsgoiTransition>
}
