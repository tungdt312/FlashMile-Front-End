import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticatedRoute/orders/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticatedRoute/orders/create"!</div>
}
