import {createRootRoute, Outlet, useLocation} from '@tanstack/react-router'
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools'
import { AnimatePresence, motion } from 'motion/react'

const RootLayout = () => {
    const location = useLocation();
    return (<>
        <AnimatePresence mode={"popLayout"}>
            <motion.div
                key={location.pathname}
                initial={{x: "100%", opacity: 0}}
                animate={{x: 0, opacity: 1}}
                transition={{duration: 0.3, ease: "easeInOut"}}
            >
            <Outlet/>
            </motion.div>
        </AnimatePresence>
        <TanStackRouterDevtools/>
    </>)

}

export const Route = createRootRoute({component: RootLayout})