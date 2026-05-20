import {type UserSummaryProjection, UserSummaryProjectionStatus} from "../../types";
import {useRouter} from "@tanstack/react-router";
import {Badge} from "../../components/ui/badge.tsx";
import {useEffect, useState} from "react";
import {useInView} from "react-intersection-observer";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuBell} from "react-icons/lu";
import {Input} from "../../components/ui/input.tsx";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {useGetAllUserProfiles} from "../../services/user-profile/user-profile.ts";


const UserList = ({search}: { search?: string }) => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState<number>(0);
    const {ref, inView} = useInView()
    const [content, setContent] = useState<UserSummaryProjection[]>([]);
    const [inputValue, setInputValue] = useState(search || "");
    const {data, isLoading, isError, isFetching} = useGetAllUserProfiles({
        page: currentPage,
        size: 10,
        filter: search ? `fullName=='^*${search}*'` : undefined
    });
    useEffect(() => {
        const handler = setTimeout(() => {
            router.navigate({
                to: "/users",
                search: {search: inputValue || undefined},
                replace: true // Replaces history entry so "Back" button isn't clogged with search steps
            });
        }, 500);

        return () => clearTimeout(handler);
    }, [inputValue, router]);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setContent([]);
        setCurrentPage(0);
    }, [search]);

    useEffect(() => {
        const newContent = data?.data?.content;
        if (newContent && newContent.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setContent((prev) => {
                if (currentPage === 0) return newContent;
                if (prev.some(item => item.id === newContent[0].id)) return prev;
                return [...prev, ...newContent];
            });
        }
    }, [data, currentPage]);
    useEffect(() => {
        const isLastPage = data?.data?.last; // Check if backend says this is the last page
        if (inView && !isFetching && !isLastPage) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentPage((prev) => prev + 1);
        }
    }, [inView, isFetching, data]);
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
                <p className={"heading text-center w-full"}>Users</p>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 rounded-full text-foreground"} onClick={() => {
                }}>
                    <LuBell size={20}/>
                </Button>
            </div>
            <div className={"w-full flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-lg"}>
                <Input className={"w-full"} placeholder={"Search User..."} value={inputValue} onChange={(e) => {
                    // Update URL params via your router to trigger the 'search' prop update
                    setInputValue(e.target.value);
                }}/>

                <div className={"w-full flex-1 flex flex-col items-center justify-start gap-4"}>
                    {content.map((item, i) => <UserCard key={i} user={item}/>)}
                    {(isLoading || isFetching) &&
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
                    <div ref={ref} className="h-10 w-full"/>
                    {isError &&
                        <p className={"w-full text-muted-foreground caption text-center"}>
                            Cannot get User list from server
                        </p>
                    }
                </div>
            </div>
        </div>
    )
}
export default UserList

const UserCard = ({user}: { user: UserSummaryProjection }) => {
    const router = useRouter();
    const statusMap: Record<UserSummaryProjectionStatus, "default" | "outline" | "secondary" | "destructive"> = {
        [UserSummaryProjectionStatus.UNVERIFIED]: "outline",
        [UserSummaryProjectionStatus.ACTIVE]: "default",
        [UserSummaryProjectionStatus.BLOCKED]: "secondary",
        [UserSummaryProjectionStatus.DELETED]: "destructive",
    };
    const variant = user.status ? statusMap[user.status] : "default";
    return (
        <div className="w-full flex flex-col p-4 hover:bg-muted rounded-2xl ring-accent ring-1 shadow-md"
             onClick={() => router.navigate({to: `/users/${user.id}/`})}>
            <Badge variant={"outline"}>{user.roleName}</Badge>
            <div className="flex items-center justify-between">
                <p className="font-bold text-primary"> {user.fullname}</p>
                <div className={"flex gap-2"}>
                    <Badge variant={variant}>{user.status}</Badge>
                </div>
            </div>
            <p className="caption text-muted-foreground w-full"><b>Email:</b> {user.email}</p>
            <p className="caption text-muted-foreground w-full"><b>Phone:</b> {user.phoneNumber}</p>

        </div>
    )
}