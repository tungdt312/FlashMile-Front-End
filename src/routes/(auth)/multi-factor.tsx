import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/multi-factor')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/multi-factor"!</div>
}
