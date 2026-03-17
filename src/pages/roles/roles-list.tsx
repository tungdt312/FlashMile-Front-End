import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuBell} from "react-icons/lu";
import {useRouter} from "@tanstack/react-router";
// import {useGetAllRoles} from "../../services/role/role.ts";
// import {useState} from "react";


const RolesList = ({search}: {search?: string}) => {
    const router = useRouter();
    console.log(search);
    // const [currentPage, setCurrentPage] = useState<number>(0);
    // const { data, isLoading, isError, error } = useGetAllRoles({page: currentPage, size: 10});
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
                <p className={"heading text-center w-full"}>Roles</p>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 border-0 rounded-full text-foreground"} onClick={() => {
                }}>
                    <LuBell size={20}/>
                </Button>
            </div>
        </div>
    )
}
export default RolesList
