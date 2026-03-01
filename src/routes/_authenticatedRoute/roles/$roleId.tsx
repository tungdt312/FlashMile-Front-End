import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticatedRoute/roles/$roleId')({
  component: RouteComponent,
})

function RouteComponent() {
    const {roleId} = Route.useParams()
  return <div>Hello "/_authenticatedRoute/roles/{roleId}"!</div>
}
