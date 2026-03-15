import { createFileRoute } from '@tanstack/react-router'
import Dashboard from "../../pages/dashboard.tsx";

export const Route = createFileRoute('/_authenticatedRoute/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Dashboard/>
}
