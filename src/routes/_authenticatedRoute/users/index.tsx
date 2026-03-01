import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticatedRoute/users/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticatedRoute/users/"!</div>
}
