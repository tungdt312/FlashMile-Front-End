import {useRouter} from "@tanstack/react-router";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuBell, LuPencilLine} from "react-icons/lu";
import {useGetDepotById} from "../../services/depot-management/depot-management.ts";
import {Badge} from "../../components/ui/badge.tsx";
import {Dialog, DialogContent, DialogTrigger} from "../../components/ui/dialog.tsx";
import {AddDepotForm} from "../../components/forms/add-depot-form.tsx";

const DepotDetail = ({id}: { id: string }) => {
    const router = useRouter()
    const depot = useGetDepotById(id)
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
                <div className="w-full flex items-center justify-between">
                    <div className={"flex gap-2 items-center"}>
                        <div className={"flex-col flex w-full"}>
                            <div className={"flex w-full gap-2"}><Badge
                                className={"bg-primary-300 text-primary"}>{depot.data?.data?.type}</Badge>
                                {depot.data?.data?.isStartNode &&
                                    <Badge className={"bg-primary-300 text-primary"}>Start node</Badge>}</div>
                            <p className="truncate heading">{depot.data?.data?.name}</p>
                        </div>
                        {depot.data?.data && <Dialog>
                            <DialogTrigger>
                                <Button size={"icon-sm"} variant={"ghost"}><LuPencilLine className={"size-5"}/></Button>
                            </DialogTrigger>
                            <DialogContent>
                                <AddDepotForm onSuccess={() => {
                                }} initialData={{...depot.data?.data}}/>
                            </DialogContent>
                        </Dialog>}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default DepotDetail
