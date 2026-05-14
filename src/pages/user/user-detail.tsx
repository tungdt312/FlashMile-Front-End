
import {useGetUserProfile, useUpdateUserRole, useUpdateUserStatus} from "../../services/user-profile/user-profile.ts";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuBell} from "react-icons/lu";
import {useRouter} from "@tanstack/react-router";
import {UserSummaryProjectionStatus} from "../../types";
import {useState} from "react";
import {toast} from "sonner";
import {Select, SelectContent, SelectItem, SelectTrigger} from "../../components/ui/select.tsx";
import {Badge} from "../../components/ui/badge.tsx";
import {ChevronDown} from "lucide-react";
import {useGetAllRoles} from "../../services/role/role.ts";


const UserDetail = ({id}: { id: string }) => {
    const router = useRouter();
    const {data: user} = useGetUserProfile(id);
    const {data: roles} = useGetAllRoles();
    const updateStatus = useUpdateUserStatus({
        mutation: {
            onSuccess: (data) => {
                if (data?.data?.status) {
                    setStatus(data.data.status)
                    toast.success(`Successfully updated user status into ${data.data.status}`);
                }
            },
            onError: () => {
                toast.error(`Error updating user status`);
            }
        }
    })
    const updateRole = useUpdateUserRole({
        mutation: {
            onSuccess: (data) => {
                if (data?.data?.roleName){
                    setRole(data.data.roleName)
                    toast.success(`Successfully updated user role into ${data.data.roleName}`)
                }
            },
            onError: () => {
                toast.error(`Error updating user role`);
            }
        }
    })
    const [status, setStatus] = useState<string>(UserSummaryProjectionStatus.UNVERIFIED)
    const [role, setRole] = useState<string>(user?.data?.roleName || "")
    const statusMap: Record<string, string> = {
        [UserSummaryProjectionStatus.UNVERIFIED]: "text-muted-foreground bg-muted",
        [UserSummaryProjectionStatus.ACTIVE]: "text-primary bg-primary/30",
        [UserSummaryProjectionStatus.BLOCKED]: "text-muted-foreground bg-muted",
        [UserSummaryProjectionStatus.DELETED]: "text-destructive bg-destructive/30",
    };
    const changeStatus = (status: UserSummaryProjectionStatus): void => {
        updateStatus.mutate({
            userId: id,
            data: {
                status: status,
            }
        })
    }
    const changeRole = (role: string): void => {
        if (!roles?.data?.content) return
        const newRole = roles?.data?.content?.find((item) => item.name === role) || undefined
        if (!newRole) return
        updateRole.mutate({
            userId: id,
            data: {
                roleId: newRole.id,
            }
        })
    }

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
                        <Select value={status} onValueChange={changeStatus}>
                            <SelectTrigger asChild>
                                <Badge className={`flex gap-2 ${statusMap[status]}`}>{status} <ChevronDown/></Badge>
                            </SelectTrigger>
                            <SelectContent className={"flex flex-col"}>
                                {Object.values(UserSummaryProjectionStatus).map((value) => <SelectItem
                                    value={value}>{value}</SelectItem>)
                                }
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <p className="caption text-muted-foreground w-full"><b>Email:</b> {user?.data?.email}</p>
                <p className="caption text-muted-foreground w-full"><b>Phone:</b> {user?.data?.phoneNumber}</p>
                <p className="caption text-muted-foreground w-full"><b>Role:</b>
                    <Select value={role} onValueChange={changeRole}>
                        <SelectTrigger asChild>
                            <Badge className={`flex gap-2}`}>{role} <ChevronDown/></Badge>
                        </SelectTrigger>
                        <SelectContent className={"flex flex-col"}>
                            {roles?.data?.content?.map((value) => {
                                if (!value?.name) return
                                return <SelectItem
                                    value={value?.name}>{value.name}</SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                </p>

            </div>
        </div>
    )
}
export default UserDetail
