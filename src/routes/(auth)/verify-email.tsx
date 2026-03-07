import { createFileRoute } from '@tanstack/react-router'
import z from "zod";
import VerifyEmail from "../../pages/auth/verify-email.tsx";
import {PageTransition} from "../../components/page-transition.tsx";

const verifyEmailSearchSchema = z.object({
  code: z.string()
})
export const Route = createFileRoute('/(auth)/verify-email')({
  component: RouteComponent,
  validateSearch: verifyEmailSearchSchema,
})

function RouteComponent() {
  const {code} = Route.useSearch()
  return <PageTransition><VerifyEmail code={code} /></PageTransition>
}
