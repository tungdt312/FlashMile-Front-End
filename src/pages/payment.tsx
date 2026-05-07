import {Button} from "../components/ui/button.tsx";
import {LuArrowLeft, LuBell} from "react-icons/lu";
import {useRouter} from "@tanstack/react-router";
import WalletDashboard from "../components/WalletDashboard.tsx";

const Payment = () => {
    const router = useRouter()
    return (
        <div className={"w-full h-dvh flex flex-col items-center bg-background"}>
            <div className={"w-full flex items-center justify-between px-4 pt-4"}>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 rounded-full text-primary!"}
                        onClick={() => {
                            router.history.back()
                        }}>
                    <LuArrowLeft size={20}/>
                </Button>
                <p className={"heading text-center w-full"}>Depot Detail</p>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 rounded-full text-foreground"} onClick={() => {
                }}>
                    <LuBell size={20}/>
                </Button>
            </div>
            <div className={"w-full flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-lg"}>
                <WalletDashboard/>
            </div>
        </div>
    )
}
export default Payment
