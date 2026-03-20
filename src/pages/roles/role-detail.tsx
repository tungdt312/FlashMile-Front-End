import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuBell, LuPencilLine, LuSave, LuTrash} from "react-icons/lu";
import {useRouter} from "@tanstack/react-router";
import {Input} from "../../components/ui/input.tsx";
import {Badge} from "../../components/ui/badge.tsx";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {
    useAssignPermissionsToRole,
    useDeleteRole,
    useGetRoleById,
    useGetRolePermissions
} from "../../services/role/role.ts";
import {useEffect, useMemo, useState} from "react";
import {useGetAllPermissions} from "../../services/permission/permission.ts";
import type {PermissionSummaryProjection} from "../../types";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "../../components/ui/collapsible.tsx";
import {ChevronDownIcon} from "lucide-react";
import {Switch} from "../../components/ui/switch.tsx";
import {Dialog, DialogContent, DialogTrigger} from "../../components/ui/dialog.tsx";
import RoleForm from "../../components/forms/add-role-form.tsx";
import {toast} from "sonner";
import ConfirmAlertDialog from "../../components/confirm-alert-dialog.tsx";


const RoleDetail = ({id, search}: { id: string, search?: string }) => {
    const router = useRouter()
    const role = useGetRoleById(id)
    const rolePerms = useGetRolePermissions(id)
    const allPerms = useGetAllPermissions({filter: search ? `name==^*${search}*` : undefined})
    const [inputValue, setInputValue] = useState("");
    const [activePerms, setActivePerms] = useState<(string | undefined) []>([]);
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const permsKeys = useMemo(() => {
        if (allPerms?.data?.data) {
            return Object.keys(allPerms.data.data);
        }
        return [];
    }, [allPerms?.data?.data]);
    useEffect(() => {
        const handler = setTimeout(() => {
            router.navigate({
                to: `/roles/${id}`,
                search: {search: inputValue || undefined},
                replace: true // Replaces history entry so "Back" button isn't clogged with search steps
            });
        }, 500);

        return () => clearTimeout(handler); // Cleanup if user types again before 500ms
    }, [id, inputValue, router]);
    useEffect(() => {
        const data = rolePerms?.data?.data;
        if (data) {
            const allIds = Object.values(data).flatMap((permissions: PermissionSummaryProjection[]) =>
                permissions.map(item => item.id) // Thay 'id' bằng tên field ID thực tế của bạn (vd: id, uuid, code...)
            );
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActivePerms(prev => {
                if (JSON.stringify(prev) === JSON.stringify(allIds)) return prev;
                return allIds;
            });
        }
    }, [rolePerms?.data?.data]);
    const deleteRole = useDeleteRole({
        mutation: {
            onSuccess: () => {
                toast.success("Role successfully deleted!");
                router.navigate({to: "/roles"});
            },
            onError: () => {
                toast.error("Error deleting role");
            }
        }
    })
    const assignPerms = useAssignPermissionsToRole({
        mutation: {
            onSuccess: () => {
                toast.success("Permission successfully updated!");
            },
            onError: () => {
                toast.error("Error updating permission");
            }
        }
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
                <div className="w-full flex items-center justify-between">
                    <div className={"flex gap-2 items-center"}>
                        <p className="truncate heading">{role?.data?.data?.name}</p>
                        {!role?.data?.data?.systemRole && <Dialog>
                            <DialogTrigger asChild>
                                <Button size={"icon-sm"} variant={"ghost"}><LuPencilLine className={"size-5"}/></Button>
                            </DialogTrigger>
                            <DialogContent>
                                <RoleForm initialData={{
                                    id: id,
                                    description: role?.data?.data?.description || "",
                                    name: role?.data?.data?.name || "",
                                }} onSuccess={() => role.refetch()}/>
                            </DialogContent>
                        </Dialog>}
                    </div>
                    <div className={"flex gap-2"}>
                        {role?.data?.data?.isDefault &&
                            <Badge className={"bg-primary-300 text-primary"}>Default role</Badge>}
                        {role?.data?.data?.systemRole && <Badge variant={"secondary"}>System role</Badge>}
                    </div>
                </div>
                <p className="caption text-muted-foreground w-full">{role?.data?.data?.description}</p>
                <Input className={"w-full"} placeholder={"Search permissions..."}
                       onChange={(e) => setInputValue(e.target.value)}/>
                <div className={"w-full flex-1 flex flex-col items-center justify-start gap-4"}>
                    {permsKeys.map((perm, i) => (
                        <Collapsible key={i} defaultOpen
                                     className="w-full p-4 hover:bg-muted rounded-2xl ring-accent ring-1 shadow-md overflow-hidden">
                            <CollapsibleTrigger asChild>
                                <div
                                    className={"link flex items-center justify-between group "}>{perm.toUpperCase()}<ChevronDownIcon
                                    className="ml-auto text-muted-foreground group-data-[state=open]:rotate-180"/></div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className={"flex flex-col w-full"}>
                                    {allPerms?.data?.data && allPerms?.data?.data[perm].map((item, key) => (
                                        <div key={key}
                                             className="w-full flex flex-col items-start justify-start py-2 hover:bg-muted border-accent border-t-1 overflow-hidden">
                                            <div className={"flex items-center justify-between w-full"}>
                                                <p className="flex items-center gap-2 truncate">{item.name} <Badge
                                                    variant={"outline"}
                                                    className={"text-primary"}> {item.action}</Badge></p>
                                                <Switch checked={activePerms.includes(item.id)}
                                                        onCheckedChange={(checked: boolean) => {
                                                            setActivePerms(prev => {
                                                                if (checked) {
                                                                    return prev.includes(item.id) ? prev : [...prev, item.id];
                                                                } else {
                                                                    return prev.filter(id => id !== item.id);
                                                                }
                                                            });
                                                        }}/>
                                            </div>
                                            <p className="caption text-muted-foreground">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                    {rolePerms.isLoading &&
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
                    {rolePerms.isError &&
                        <p className={"w-full text-muted-foreground caption text-center"}>
                            Cannot get permissions list from server
                        </p>
                    }
                </div>
                {!role?.data?.data?.systemRole &&
                    <Button className={"w-full"} onClick={() => assignPerms.mutate({
                        id: id,
                        data: {
                            permissionIds: activePerms as string[]
                        }
                    })}><LuSave className={"size-6"}/> Save</Button>
                }
                {!role?.data?.data?.systemRole &&
                    <ConfirmAlertDialog title={"Delete Role Confirm"}
                                        description={"Are you sure you want to delete this role?"}
                                        onConfirm={() => deleteRole.mutate({id: id})}>
                        <Button className={"w-full"} variant={"destructive"}><LuTrash className={"size-6"}/> Delete Role</Button>
                    </ConfirmAlertDialog>
                }
            </div>
        </div>
    )
}
export default RoleDetail
