import {createFileRoute} from '@tanstack/react-router'
import Landpage from "../pages/auth/landpage.tsx";
import {SsgoiTransition} from "@ssgoi/react";

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    return <SsgoiTransition id={"/"}><Landpage/></SsgoiTransition>
}