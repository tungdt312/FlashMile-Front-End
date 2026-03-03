import {Button} from "../../components/ui/button.tsx";
import {FcGoogle} from "react-icons/fc";
import {Link, useNavigate} from "@tanstack/react-router";
import {motion} from "motion/react"
import {containerVariants, itemVariants} from "../../lib/motion.ts";

const Landpage = () => {
    const navigate = useNavigate();
    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
            <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url('/landpage.jpg')`,
                    backgroundRepeat: 'no-repeat',
                }}
                initial={{scale: 1.1}}
                animate={{scale: 1}}
                transition={{duration: 1.5, ease: "easeOut"}}
            />
            <motion.div
                initial="hidden" // Trạng thái bắt đầu
                animate="visible" // Trạng thái đích
                variants={containerVariants} // Áp dụng các biến thể
                className={"p-8 gap-8 flex flex-col items-center justify-end md:justify-center h-full w-full z-10 bg-linear-to-t from-[#1E1E1E] to-[#1E1E1E]/70"}>
                <div className={"gap-4 flex flex-col items-center justify-center w-full max-w-xs"}>
                    <motion.img variants={itemVariants} src={'/full-logo.svg'} alt=""/>
                    <motion.div variants={itemVariants}
                                className={"text-3xl font-bold text-center w-full text-primary-foreground"}>With
                        FlashMile, Delivery in a flash.
                    </motion.div>
                </div>
                <motion.div
                    variants={itemVariants}
                    className={"gap-4 flex flex-col items-center justify-center w-full max-w-xs"}>
                    <Button asChild
                            className={"rounded-full w-full text-primary-foreground bg-linear-to-r from-primary to-brand cursor-pointer"}>
                        <motion.button
                            whileHover={{scale: 1.1}}
                            whileTap={{scale: 0.95}}
                            onClick={() => navigate({to: "/sign-up"})}>
                            Create new account
                        </motion.button>
                    </Button>

                    <Button variant={"outline"}
                            className={"rounded-full w-full text-primary-foreground bg-transparent cursor-pointer"}>
                        <FcGoogle/>
                        Continue with Google
                    </Button>
                    <Link to={"/sign-in"} className={"text-primary font-medium text-sm"}>Sign in</Link>
                </motion.div>
            </motion.div>
        </div>

    )
}
export default Landpage
