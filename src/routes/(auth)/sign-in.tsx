import { createFileRoute } from '@tanstack/react-router'
import SignIn from "../../pages/auth/sign-in.tsx";
import {PageTransition} from "../../components/page-transition.tsx";

export const Route = createFileRoute('/(auth)/sign-in')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageTransition><SignIn/></PageTransition>
}
