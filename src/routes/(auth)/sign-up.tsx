import { createFileRoute } from '@tanstack/react-router'
import SignUp from "../../pages/auth/sign-up.tsx";
import {PageTransition} from "../../components/page-transition.tsx";

export const Route = createFileRoute('/(auth)/sign-up')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageTransition><SignUp/></PageTransition>
}
