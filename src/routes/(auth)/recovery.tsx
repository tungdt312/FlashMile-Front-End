import {createFileRoute} from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import Recovery from "../../pages/auth/recovery.tsx";
import z from "zod";
const multifactorSearchSchema = z.object({
  challengeId: z.string().optional(),

})
export const Route = createFileRoute('/(auth)/recovery')({
  component: RouteComponent,
  validateSearch: multifactorSearchSchema,
})

function RouteComponent() {
  const {challengeId} = Route.useSearch()
  return <SsgoiTransition id={"recovery"}><Recovery challengeId={challengeId}/></SsgoiTransition>
}
