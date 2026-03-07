import {motion} from "motion/react";
import type {ReactNode} from "react";

export const PageTransition = ({children}: { children: ReactNode}) => {
    return (
        <>
            <motion.div
                initial={{x: "100%", opacity: 1}}
                animate={{x: 0, opacity: 1}}
                exit={{x: "100%", opacity: 1}}
                transition={{duration: 0.3, ease: "easeInOut"}}
                style={{
                    position: 'absolute', // Bắt buộc để 2 trang trượt đè lên nhau
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }}
            >
                {children}
            </motion.div>
        </>
    );
};