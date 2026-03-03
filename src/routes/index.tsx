import { createFileRoute } from '@tanstack/react-router'
import Landpage from "../pages/auth/landpage.tsx";

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    return Landpage()
}