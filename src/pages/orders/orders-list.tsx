import type {OrderSummaryProjection} from "../../types";
import {Badge} from "../../components/ui/badge.tsx";
import {useRouter} from "@tanstack/react-router";
import {useEffect, useState} from "react";
import {useInView} from "react-intersection-observer";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuBell, LuPlus} from "react-icons/lu";
import {Input} from "../../components/ui/input.tsx";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {useGetAllOrders} from "../../services/order-management/order-management.ts";
import {Dialog, DialogContent, DialogTrigger} from "../../components/ui/dialog.tsx";
import CreateOrderForm from "../../components/forms/create-order-form.tsx";
import {useAuthStore} from "../../lib/global.ts";

const OrdersList = ({search}: {search?: string}) => {
    const router = useRouter();
    const user = useAuthStore()
    const [currentPage, setCurrentPage] = useState<number>(0);
    const {ref, inView} = useInView()
    const [content, setContent] = useState<OrderSummaryProjection[]>([]);
    const [inputValue, setInputValue] = useState(search || "");
    const searching = () => {
        const filters = [];

        if (search) {
            filters.push(`id=='^*${search}*'`);
        }

        if (user.permissionCodes[0] == "USER") {
            filters.push(`customerID=='^*${user.user?.id}*'`);
        }
        if (user.permissionCodes[0] == "DELIVERER") {
            filters.push(`assignedDriverId=='^*${user.user?.id}*'`);
        }

        return filters.length > 0 ? filters.join(' and ') : undefined;
    }
    const {data, isLoading, isError, isFetching} = useGetAllOrders({
        page: currentPage,
        size: 10,
        filter: searching()
    });
    useEffect(() => {
        const handler = setTimeout(() => {
            router.navigate({
                to: "/orders",
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
                <p className={"heading text-center w-full"}>Orders</p>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 rounded-full text-foreground"} onClick={() => {
                }}>
                    <LuBell size={20}/>
                </Button>
            </div>
            <div className={"w-full flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-lg"}>
                <Input className={"w-full"} placeholder={"Search Order..."} value={inputValue} onChange={(e) => {
                    // Update URL params via your router to trigger the 'search' prop update
                    setInputValue(e.target.value);
                }}/>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className={"w-full"}><LuPlus className={"size-6"}/> Create new Order</Button>
                    </DialogTrigger>
                    <DialogContent  className={"flex flex-col overflow-y-auto max-h-4/5"}>
                        <CreateOrderForm/>
                    </DialogContent>
                </Dialog>
                <div className={"w-full flex-1 flex flex-col items-center justify-start gap-4"}>
                    {content.map((item, i) => <OrderItem key={i} order={item}/>)}
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
export default OrdersList

export const OrderItem = ({order}: {order: OrderSummaryProjection}) => {
    const router = useRouter()
    return (
        <div className="w-full flex flex-col p-4 hover:bg-muted rounded-2xl ring-accent ring-1 shadow-md"
             onClick={() => router.navigate({to: `/orders/${order.id}/`})}>
            <Badge variant={"outline"}>{order.type}</Badge>
            <div className="flex items-center justify-between">
                <p className="font-bold text-primary"> Order: {order.id}</p>
                <div className={"flex gap-2"}>
                    <Badge>{order.status}</Badge>
                </div>
            </div>
            <p className="caption text-muted-foreground w-full"> <b>Address:</b> {order.recipientAddress}</p>
            <p className="caption text-muted-foreground w-full"> <b>Total:</b> {order.totalAmount}</p>

        </div>
    )
}