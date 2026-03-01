import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticatedRoute/users/$userId')({
  component: RouteComponent,
})

function RouteComponent() {
    const {userId} = Route.useParams()
  return <div>Hello "/_authenticatedRoute/users/{userId}"!</div>
}
