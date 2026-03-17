import {createFileRoute} from '@tanstack/react-router'
import z from "zod";
import MultiFactorSet from "../../pages/user/multi-factor-set.tsx";
import {SsgoiTransition} from "@ssgoi/react";

const multifactorSearchSchema = z.object({
  step: z.number().optional(),
  method: z.string().optional(),
})
export const Route = createFileRoute('/_authenticatedRoute/multi-factor-set')({
  component: RouteComponent,
  validateSearch: multifactorSearchSchema
})

function RouteComponent() {
  const {step, method} = Route.useSearch();
  return <SsgoiTransition id={"/multi-factor-set"}><MultiFactorSet step={step} method={method}/></SsgoiTransition>
}
