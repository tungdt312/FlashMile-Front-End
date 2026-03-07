import { createFileRoute } from '@tanstack/react-router'
import Landpage from "../pages/auth/landpage.tsx";
import {PageTransition} from "../components/page-transition.tsx";

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    return <PageTransition><Landpage/></PageTransition>
}