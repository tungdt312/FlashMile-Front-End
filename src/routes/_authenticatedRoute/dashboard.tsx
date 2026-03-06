import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticatedRoute/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticatedRoute/dashboard"!</div>
}
