import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuBell} from "react-icons/lu";
import {useRouter} from "@tanstack/react-router";


const RoleDetail = ({id, search}:{id: string, search?: string}) => {
    const router = useRouter()
    console.log(id, search)
    return (
        <div className={"w-full h-dvh flex flex-col items-center bg-background"}>
            <div className={"w-full flex items-center justify-between px-4 pt-4"}>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 border-0 rounded-full text-primary!"}
                        onClick={() => {
                            router.history.back()
                        }}>
                    <LuArrowLeft size={20}/>
                </Button>
                <p className={"heading text-center w-full"}>Permissions</p>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 border-0 rounded-full text-foreground"} onClick={() => {
                }}>
                    <LuBell size={20}/>
                </Button>
            </div>
        </div>
    )
}
export default RoleDetail
