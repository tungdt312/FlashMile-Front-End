import {motion} from "motion/react";
import type {ReactNode} from "react";

export const PageTransition = ({children}: { children: ReactNode}) => {
    return (
        <>
            <motion.div
                initial={{x: "100%", opacity: 0}}
                animate={{x: 0, opacity: 1}}
                exit={{x: "100%", opacity: 0}}
                transition={{duration: 0.5, ease: "easeInOut"}}
            >
                {children}
            </motion.div>
        </>
    );
};