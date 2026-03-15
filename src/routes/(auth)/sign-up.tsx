import {createFileRoute} from '@tanstack/react-router'
import SignUp from "../../pages/auth/sign-up.tsx";
import {SsgoiTransition} from "@ssgoi/react";
import z from "zod";
const SignUpSearchSchema = z.object({
  provider: z.string().optional(),
  step: z.number().optional(),
})
export const Route = createFileRoute('/(auth)/sign-up')({
  component: RouteComponent,
  validateSearch: SignUpSearchSchema,
})

function RouteComponent() {
  const {provider, step} = Route.useSearch()
  return <SsgoiTransition id={"/sign-up"}><SignUp provider={provider} step={step}/></SsgoiTransition>
}
