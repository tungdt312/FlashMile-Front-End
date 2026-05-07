import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticatedRoute/payment-result')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticatedRoute/payment-result"!</div>
}
