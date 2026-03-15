import {
    LuArrowLeft,
    LuBell,
    LuBookMarked,
    LuChevronRight, LuCircleHelp, LuKey, LuLock, LuLogOut,
    LuMail,
    LuPencilLine,
    LuPhone,
    LuWallet
} from "react-icons/lu";
import {Button} from "../../components/ui/button.tsx";
import {useRouter} from "@tanstack/react-router";
import {useAuthStore} from "../../lib/global.ts";
import {Avatar, AvatarFallback, AvatarImage} from "../../components/ui/avatar.tsx";
import {Switch} from "../../components/ui/switch.tsx";
import {useLogoutUser} from "../../services/authentication/authentication.ts";
import {toast} from "sonner";


const Setting = () => {
    const router = useRouter();
    const {user} = useAuthStore();
    const logOutService = useLogoutUser({
        mutation: {
            onError: (err) => {
                console.log(err);
                toast.error(err.response?.data.message || "Log out failed!");
            }
        }
    })
    return (
        <div className={"w-full h-dvh flex flex-col items-center bg-background"}>
            <div className={"w-full flex items-center justify-between px-4 pt-4"}>
                <Button size={"icon-lg"} variant={"outline"} className={"ring-0 border-0 rounded-full text-primary!"}
                        onClick={() => {
                            router.history.back()
                        }}>
                    <LuArrowLeft size={20}/>
                </Button>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 border-0 rounded-full text-foreground"} onClick={() => {
                }}>
                    <LuBell size={20}/>
                </Button>
            </div>
            <div className={"w-full flex flex-col items-center justify-center p-4 gap-4 max-w-lg"}>
                <div
                    className="w-full flex items-center gap-4 p-4 rounded-2xl ring-accent ring-1 shadow-sm overflow-hidden">
                    {/* Avatar: Dùng flex-shrink-0 để không bị bóp méo */}
                    <Avatar className="size-[60px] flex-shrink-0 ring-1 ring-primary">
                        <AvatarImage src={""} className="object-cover"/>
                        <AvatarFallback>{user?.fullName?.charAt(0) || "A"}</AvatarFallback>
                    </Avatar>

                    {/* Info Container: Cần min-w-0 để các con bên trong truncate được */}
                    <div className="flex-1 min-w-0 flex flex-col items-start">
                        <div className="w-full flex items-center justify-between gap-2">
                            <p className="font-bold text-lg truncate">
                                {user?.fullName || "Administrator"}
                            </p>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="size-8 flex-shrink-0 rounded-full text-muted-foreground"
                                onClick={() => {
                                }}
                            >
                                <LuPencilLine size={18}/>
                            </Button>
                        </div>

                        <p className="w-full flex items-center gap-2 truncate font-medium text-xs text-muted-foreground">
                            <LuMail className="flex-shrink-0"/>
                            <span className="truncate">{user?.email}</span>
                        </p>

                        <p className="w-full flex items-center gap-2 truncate font-medium text-xs text-muted-foreground">
                            <LuPhone className="flex-shrink-0"/>
                            <span className="truncate">{user?.phoneNumber}</span>
                        </p>
                    </div>
                </div>
                <div className={"w-full flex flex-col gap-2"}>
                    <p className={"text-sm font-semibold text-muted-foreground w-full px-4"}>General</p>
                    <div
                        className="w-full flex flex-col items-center rounded-2xl ring-accent ring-1 shadow-sm overflow-hidden">
                        <div className="w-full flex items-center justify-between p-4 hover:bg-muted">
                            <LuWallet className="flex-shrink-0 text-primary w-5"/>
                            <div className="w-full  min-w-0 px-2">
                                <p className="font-semibold text-sm truncate">E-wallet</p>
                                <p className="text-xs text-primary truncate">999.999đ</p>
                            </div>
                            <LuChevronRight className="flex-shrink-0 text-muted-foreground w-5"/>
                        </div>
                        <div className="w-full flex items-center justify-between p-4 hover:bg-muted">
                            <LuBookMarked className="flex-shrink-0 text-brand w-5"/>
                            <div className="w-full  min-w-0 px-2">
                                <p className="font-semibold text-sm truncate">Contacts</p>
                                <p className="text-xs text-muted-foreground truncate">99 contacts</p>
                            </div>
                            <LuChevronRight className="flex-shrink-0 text-muted-foreground w-5"/>
                        </div>
                    </div>
                </div>
                <div className={"w-full flex flex-col gap-2"}>
                    <p className={"text-sm font-semibold text-muted-foreground w-full px-4"}>Notification</p>
                    <div
                        className="w-full flex flex-col items-center rounded-2xl ring-accent ring-1 shadow-sm overflow-hidden">
                        <div className="w-full flex items-center justify-between p-4 hover:bg-muted">
                            <LuBell className="flex-shrink-0 text-primary w-5"/>
                            <div className="w-full  min-w-0 px-2">
                                <p className="font-semibold text-sm truncate">Popup Notification</p>
                                <p className="text-xs text-muted-foreground truncate">Notification will popup on your
                                    mobile device</p>
                            </div>
                            <Switch className="flex-shrink-0 text-muted-foreground w-5"/>
                        </div>
                    </div>
                </div>
                <div className={"w-full flex flex-col gap-2"}>
                    <p className={"text-sm font-semibold text-muted-foreground w-full px-4"}>Security</p>
                    <div
                        className="w-full flex flex-col items-center rounded-2xl ring-accent ring-1 shadow-sm overflow-hidden">
                        <div className="w-full flex items-center justify-between p-4 hover:bg-muted">
                            <LuKey className="flex-shrink-0 text-primary w-5"/>
                            <div className="w-full  min-w-0 px-2">
                                <p className="font-semibold text-sm truncate">Change Password</p>
                            </div>
                            <LuChevronRight className="flex-shrink-0 text-muted-foreground w-5"/>
                        </div>
                        <div className="w-full flex items-center justify-between p-4 hover:bg-muted" onClick={() => {
                            router.navigate({to: "/multi-factor-set"})
                        }}>
                            <LuLock className="flex-shrink-0 text-primary w-5"/>
                            <div className="w-full  min-w-0 px-2">
                                <p className="font-semibold text-sm truncate">Multi-factor Authentication</p>
                            </div>
                            <LuChevronRight className="flex-shrink-0 text-muted-foreground w-5"/>
                        </div>
                    </div>
                </div>
                <Button variant={"outline"} className={"w-full"}>
                    <LuCircleHelp className={"pl-2 size-6"}/> Help and support
                </Button>
                <Button variant={"destructive"} className={"w-full"} disabled={logOutService.isPending} onClick={() => {
                    logOutService.mutate({data: {refreshToken: ""}})
                }}>
                    <LuLogOut className={"pl-2 size-6"}/> Log out
                </Button>
            </div>
        </div>
    )
}
export default Setting
