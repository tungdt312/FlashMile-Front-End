import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuBell} from "react-icons/lu";
import {useRouter} from "@tanstack/react-router";
import WardList from "./ward-list.tsx";
import {useGetProvinceById} from "../../services/province-management/province-management.ts";

const ProvinceDetail = ({id, search}: {id: string, search?:string}) => {
    const router = useRouter()
    const province = useGetProvinceById(id)
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
                <p className={"heading text-center w-full"}>{province.data?.data?.name}</p>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 rounded-full text-foreground"} onClick={() => {
                }}>
                    <LuBell size={20}/>
                </Button>
            </div>
            <WardList provinceName={""} search={search}/>
        </div>
    )
}
export default ProvinceDetail
