import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticatedRoute/orders/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticatedRoute/orders/$id"!</div>
}
