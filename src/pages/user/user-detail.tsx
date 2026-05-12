import {useGetUserProfile} from "../../services/user-profile/user-profile.ts";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuBell} from "react-icons/lu";
import {useRouter} from "@tanstack/react-router";
import {Badge} from "../../components/ui/badge.tsx";
import {UserSummaryProjectionStatus} from "../../types";


const UserDetail = ({id}:{id: string}) => {
    const router = useRouter();
    const {data: user} = useGetUserProfile(id);

    const statusMap: Record<UserSummaryProjectionStatus, "default" | "outline" | "secondary" | "destructive"> = {
        [UserSummaryProjectionStatus.UNVERIFIED]: "outline",
        [UserSummaryProjectionStatus.ACTIVE]: "default",
        [UserSummaryProjectionStatus.BLOCKED]: "secondary",
        [UserSummaryProjectionStatus.DELETED]: "destructive",
    };
    const variant = user?.data?.status ? statusMap[user.data.status as UserSummaryProjectionStatus] : "default";

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
                <p className={"heading text-center w-full"}>User Detail</p>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 rounded-full text-foreground"} onClick={() => {
                }}>
                    <LuBell size={20}/>
                </Button>
            </div>
            <div className={"w-full flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-lg"}>
                <div className="flex items-center justify-between">
                    <p className="font-bold text-primary"> {user?.data?.fullName}</p>
                    <div className={"flex gap-2"}>
                        <Badge variant={variant}>{user?.data?.status}</Badge>
                    </div>
                </div>
                <p className="caption text-muted-foreground w-full"><b>Email:</b> {user?.data?.email}</p>
                <p className="caption text-muted-foreground w-full"><b>Phone:</b> {user?.data?.phoneNumber}</p>
            </div>
        </div>
    )
}
export default UserDetail
