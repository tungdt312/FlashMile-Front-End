import {createRootRoute, Outlet} from '@tanstack/react-router'
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools'
import {Ssgoi} from "@ssgoi/react";
import {drill} from "@ssgoi/core/view-transitions";

const RootLayout = () => {
    return (<>
        <Ssgoi config={{
            defaultTransition: drill({direction: "enter"}), transitions: [{
                from: "*",
                to: "*",
                transition: drill({direction: "enter"}),
                symmetric: true,
            }]
        }}>
            <div style={{position: "relative"}}><Outlet/></div>
        </Ssgoi>
        <TanStackRouterDevtools/>
    </>)

}

export const Route = createRootRoute({component: RootLayout})