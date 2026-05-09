// src/pages/vehicle/vehicle-list.tsx
import { Button } from "../../components/ui/button.tsx";
import { LuArrowLeft, LuBell, LuPlus } from "react-icons/lu";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input.tsx";
import { Badge } from "../../components/ui/badge.tsx";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { useInView } from "react-intersection-observer";
import type { VehicleSummaryProjection } from "../../types";
import { Dialog, DialogContent, DialogTrigger } from "../../components/ui/dialog.tsx";
import { useGetAllVehicles } from "../../services/vehicle-management/vehicle-management.ts";
import { VehicleForm } from "../../components/forms/vehicle-form.tsx";
import { PenSquare, Truck, Weight, Package } from "lucide-react";

const VehiclesList = ({ search }: { search?: string }) => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState<number>(0);
    const { ref, inView } = useInView();
    const [content, setContent] = useState<VehicleSummaryProjection[]>([]);
    const [inputValue, setInputValue] = useState(search || "");

    const { data, isLoading, isError, isFetching, refetch } = useGetAllVehicles({
        page: currentPage,
        size: 10,
        filter: search ? `licensePlate==^*${search}*` : undefined,
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            router.navigate({
                to: "/vehicle",
                search: { search: inputValue || undefined },
                replace: true,
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
                if (prev.some((item) => item.id === newContent[0].id)) return prev;
                return [...prev, ...newContent];
            });
        }
    }, [data, currentPage]);

    useEffect(() => {
        const isLastPage = data?.data?.last;
        if (inView && !isFetching && !isLastPage) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentPage((prev) => prev + 1);
        }
    }, [inView, isFetching, data]);

    return (
        <div className={"w-full h-dvh flex flex-col items-center bg-background"}>
            {/* Header */}
            <div className={"w-full flex items-center justify-between px-4 pt-4"}>
                <Button
                    size={"icon-lg"}
                    variant={"outline"}
                    className={"size-10 ring-0 rounded-full text-primary!"}
                    onClick={() => {
                        router.history.back();
                    }}
                >
                    <LuArrowLeft size={20} />
                </Button>
                <p className={"heading text-center w-full"}>Vehicles</p>
                <Button
                    size={"icon-lg"}
                    variant={"outline"}
                    className={"size-10 ring-0 rounded-full text-foreground"}
                    onClick={() => {}}
                >
                    <LuBell size={20} />
                </Button>
            </div>

            {/* Content */}
            <div className={"w-full flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-lg"}>
                {/* Search Input */}
                <Input
                    className={"w-full"}
                    placeholder={"Search by license plate..."}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                    }}
                />

                {/* Add New Vehicle Button */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className={"w-full"}>
                            <LuPlus className={"size-6"} /> Add new vehicle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <VehicleForm onSuccess={() => refetch()} />
                    </DialogContent>
                </Dialog>

                {/* Vehicles List */}
                <div className={"w-full flex-1 flex flex-col items-center justify-start gap-4"}>
                    {content.map((item, i) => (
                        <VehicleCard key={i} vehicle={item} onEdit={refetch} />
                    ))}

                    {/* Loading Skeletons */}
                    {(isLoading || isFetching) && (
                        <div className="w-full flex flex-col items-center justify-between p-4 hover:bg-muted rounded-2xl ring-accent ring-1 shadow-md overflow-hidden">
                            <div className={"link flex items-center justify-between"}>
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-5 w-[75px]" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    )}

                    {/* Infinite Scroll Trigger */}
                    <div ref={ref} className="h-10 w-full" />

                    {/* Error State */}
                    {isError && (
                        <p className={"w-full text-muted-foreground caption text-center"}>
                            Cannot get vehicle list from server
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehiclesList;

const VehicleCard = ({
                         vehicle,
                         onEdit,
                     }: {
    vehicle: VehicleSummaryProjection;
    onEdit: () => void;
}) => {
    return (
        <div className="w-full flex flex-col p-4 hover:bg-muted rounded-2xl ring-accent ring-1 shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Truck className="size-5 text-primary" />
                    </div>
                    <p className="font-bold">{vehicle.licensePlate}</p>
                </div>
                <div className={"flex gap-2"}>
                    <Badge variant={"secondary"}>{vehicle.type}</Badge>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size={"icon-sm"}>
                                <PenSquare className={"size-6"} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <VehicleForm
                                onSuccess={onEdit}
                                initialData={vehicle}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Vehicle Details Grid */}
            <div className="mt-3 grid grid-cols-2 gap-2">
                {vehicle.maxWeight && (
                    <div className="flex items-center gap-2 caption text-muted-foreground bg-muted/30 p-2 rounded">
                        <Weight className="size-4" />
                        <span>{vehicle.maxWeight} kg</span>
                    </div>
                )}
                {vehicle.maxVolume && (
                    <div className="flex items-center gap-2 caption text-muted-foreground bg-muted/30 p-2 rounded">
                        <Package className="size-4" />
                        <span>{vehicle.maxVolume} m³</span>
                    </div>
                )}
            </div>

            {/* Shipper Info */}
            {vehicle.shipperId && (
                <p className="caption text-muted-foreground w-full mt-2">
                    <b>Shipper:</b> {vehicle.shipperId}
                </p>
            )}
        </div>
    );
};
