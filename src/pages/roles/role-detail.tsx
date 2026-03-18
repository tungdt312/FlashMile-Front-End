import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuBell, LuPencilLine} from "react-icons/lu";
import {useRouter} from "@tanstack/react-router";
import {Input} from "../../components/ui/input.tsx";
import {Badge} from "../../components/ui/badge.tsx";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {useGetRolePermissions} from "../../services/role/role.ts";


const RoleDetail = ({id, search}: { id: string, search?: string }) => {
    const router = useRouter()
    const {data, isLoading, isError} = useGetRolePermissions(id, {
        page: 0,
        size: 10,
        filter: search ? `code==^*${search}*` : undefined
    })
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
                <p className={"heading text-center w-full"}>Permissions</p>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 rounded-full text-foreground"} onClick={() => {
                }}>
                    <LuBell size={20}/>
                </Button>
            </div>
            <div className={"w-full flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-lg"}>
                <p className="truncate heading">E-wallet</p>
                <p className="caption text-primary truncate">999.999đ</p>

                <Input className={"w-full"} placeholder={"Search roles..."}/>
                <div className={"w-full flex-1 flex flex-col items-center justify-center gap-4"}>
                    {data?.data?.content?.map((item, i) => {
                        return (
                            <div key={i}
                                 className="w-full flex flex-col items-center justify-between p-4 hover:bg-muted rounded-2xl ring-accent ring-1 shadow-md overflow-hidden">
                                <div className={"link flex items-center justify-between"}>
                                    <p className="truncate">{item.code}</p>
                                    <Badge>33 perms</Badge>
                                </div>
                                <p className="caption text-primary truncate">description</p>
                            </div>)
                    })}
                    {isLoading &&
                        <div
                            className="w-full flex flex-col items-center justify-between p-4 hover:bg-muted rounded-2xl ring-accent ring-1 shadow-md overflow-hidden">
                            <div className={"link flex items-center justify-between"}>
                                <Skeleton className="h-5 w-1/3"/>
                                <Skeleton className="h-5 w-[75px]"/>
                            </div>
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-1/2"/>
                        </div>
                    }
                    {isError &&
                        <p className={"w-full text-muted-foreground caption text-center"}>
                            Cannot get roles list from server
                        </p>
                    }
                </div>
                <Button className={"w-full"}><LuPencilLine className={"size-6"}/> Modify</Button>
            </div>
        </div>
    )
}
export default RoleDetail
