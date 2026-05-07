import {createFileRoute} from '@tanstack/react-router'
import HomePage from "../../pages/homepage.tsx";

export const Route = createFileRoute('/_authenticatedRoute/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <HomePage/>
}
