import {useRouter} from "@tanstack/react-router";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuBell} from "react-icons/lu";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../components/ui/tabs.tsx";
import ProvinceList from "./province-list.tsx";
import WardList from "./ward-list.tsx";

const AreaList = ({search, type}: {search?: string, type: string}) => {
    const router = useRouter();

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
                <p className={"heading text-center w-full"}>Areas</p>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 rounded-full text-foreground"} onClick={() => {
                }}>
                    <LuBell size={20}/>
                </Button>
            </div>
            <Tabs defaultValue={type} className={"w-full max-w-lg flex flex-col items-center"}>
                <TabsList className={"w-full flex mx-4"}>
                    <TabsTrigger value={"province"} className={"flex-1"}>Provinces</TabsTrigger>
                    <TabsTrigger value={"ward"} className={"flex-1"}>Wards</TabsTrigger>
                </TabsList>
                <TabsContent value={"province"} className={"w-full"}>
                    <ProvinceList search={search}/>
                </TabsContent>
                <TabsContent value={"ward"} className={"w-full"}>
                    <WardList search={search}/>
                </TabsContent>
            </Tabs>
        </div>
    )
}
export default AreaList
