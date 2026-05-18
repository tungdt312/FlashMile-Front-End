/**
 * Public Order Tracking (Tra cứu đơn hàng) Page Component
 * Features:
 * - Search tracking code via input with Enter or button click
 * - URL query parameter sync (?code=XYZ)
 * - Vertical timeline showing order lifecycle
 * - Responsive mobile-first design
 * - Error handling with user-friendly messages
 * - Loading skeleton states
 */

import {useEffect, useState} from "react";
import {useGetOrderByTrackingCode} from "../../services/order-management/order-management";

// UI Components
import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";
import {Card} from "../../components/ui/card";
import {Badge} from "../../components/ui/badge";
import {Skeleton} from "../../components/ui/skeleton";

// Types
import type {OrderDetailProjection, OrderSummaryProjection} from "../../types";
import {OrderDetailProjectionStatus} from "../../types";
import {LucideCheckCircle2, LucideUserCheck, LucideXCircle} from "lucide-react";

// Icons
import {LuArrowLeft, LuBell, LuClock, LuMapPin, LuPackage, LuPhone, LuTruck} from "react-icons/lu";
import {useRouter} from "@tanstack/react-router";

// ============================================================================
// Timeline Step Configuration
// ============================================================================
interface TimelineStep {
    status: string;
    label: string;
    description: string;
    icon: React.ReactNode;
}

const TIMELINE_STEPS: TimelineStep[] = [
    {
        status: OrderDetailProjectionStatus.PENDING,
        label: "Pending",
        description: "Order has been received",
        icon: <LuClock className="w-5 h-5" />,
    },
    {
        status: OrderDetailProjectionStatus.CONFIRMED,
        label: "Confirmed",
        description: "Order has been confirmed",
        icon: <LucideCheckCircle2 className="w-5 h-5" />,
    },
    {
        status: OrderDetailProjectionStatus.ASSIGNED,
        label: "Assigned",
        description: "Assigned to a driver",
        icon: <LucideUserCheck className="w-5 h-5" />,
    },
    {
        status: OrderDetailProjectionStatus.IN_TRANSIT,
        label: "In Transit",
        description: "Order is on the way",
        icon: <LuTruck className="w-5 h-5" />,
    },
    {
        status: OrderDetailProjectionStatus.DELIVERED,
        label: "Delivered",
        description: "Order has been successfully delivered",
        icon: <LucideCheckCircle2 className="w-5 h-5" />,
    },
];

const FAILED_STEPS: TimelineStep[] = [
    {
        status: OrderDetailProjectionStatus.REJECTED,
        label: "Rejected",
        description: "Order has been rejected",
        icon: <LucideXCircle className="w-5 h-5" />,
    },
    {
        status: OrderDetailProjectionStatus.CANCELLED,
        label: "Cancelled",
        description: "Order has been cancelled",
        icon: <LucideXCircle className="w-5 h-5" />,
    },
];

// ============================================================================
// Helper: Mask Phone Number
// ============================================================================
const maskPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return "N/A";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 6) return phone;
    return cleaned.slice(0, 2) + "****" + cleaned.slice(-3);
};

// ============================================================================
// Helper: Format Address (Truncate for display)
// ============================================================================
const formatAddress = (address: string | undefined): string => {
    if (!address) return "N/A";
    return address.length > 40 ? address.substring(0, 40) + "..." : address;
};

// ============================================================================
// Helper: Get Status Badge Color
// ============================================================================
const getStatusBadgeColor = (status?: string): string => {
    switch (status) {
        case OrderDetailProjectionStatus.PENDING:
            return "bg-yellow-100 text-yellow-800";
        case OrderDetailProjectionStatus.CONFIRMED:
            return "bg-blue-100 text-blue-800";
        case OrderDetailProjectionStatus.ASSIGNED:
            return "bg-indigo-100 text-indigo-800";
        case OrderDetailProjectionStatus.IN_TRANSIT:
            return "bg-purple-100 text-purple-800";
        case OrderDetailProjectionStatus.DELIVERED:
            return "bg-green-100 text-green-800";
        case OrderDetailProjectionStatus.REJECTED:
            return "bg-red-100 text-red-800";
        case OrderDetailProjectionStatus.CANCELLED:
            return "bg-gray-100 text-gray-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

// ============================================================================
// Helper: Get Status Label (Vietnamese)
// ============================================================================
const getStatusLabel = (status?: string): string => {
    switch (status) {
        case OrderDetailProjectionStatus.PENDING:
            return "Chờ xác nhận";
        case OrderDetailProjectionStatus.CONFIRMED:
            return "Đã xác nhận";
        case OrderDetailProjectionStatus.ASSIGNED:
            return "Đã phân công";
        case OrderDetailProjectionStatus.IN_TRANSIT:
            return "Đang giao";
        case OrderDetailProjectionStatus.DELIVERED:
            return "Đã giao";
        case OrderDetailProjectionStatus.REJECTED:
            return "Bị từ chối";
        case OrderDetailProjectionStatus.CANCELLED:
            return "Đã hủy";
        default:
            return "Không xác định";
    }
};

// ============================================================================
// Component: Timeline
// ============================================================================
const TrackingTimeline = ({ order }: { order: OrderDetailProjection }) => {
    const isFailed =
        order.status === OrderDetailProjectionStatus.REJECTED ||
        order.status === OrderDetailProjectionStatus.CANCELLED;

    const displaySteps = isFailed ? FAILED_STEPS : TIMELINE_STEPS;

    const getStepIndex = (status?: string): number => {
        return TIMELINE_STEPS.findIndex((step) => step.status === status);
    };

    const currentStepIndex = getStepIndex(order.status);

    return (
        <div className="relative">
            {/* Timeline container */}
            <div className="space-y-4">
                {displaySteps.map((step, index) => {
                    const isCompleted =
                        currentStepIndex >= index && !isFailed;
                    const isActive = order.status === step.status;
                    const isFutureStep =
                        currentStepIndex < index && !isFailed;

                    return (
                        <div key={step.status} className="flex gap-4 relative">
                            {/* Timeline line connector */}
                            {index < displaySteps.length - 1 && (
                                <div
                                    className={`absolute left-[22px] top-12 w-0.5 h-12 -z-10 transition-colors ${
                                        isCompleted
                                            ? "bg-green-500"
                                            : isFutureStep
                                                ? "bg-gray-200"
                                                : isActive
                                                    ? "bg-blue-500"
                                                    : "bg-gray-200"
                                    }`}
                                />
                            )}

                            {/* Timeline icon */}
                            <div
                                className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                                    isActive
                                        ? "bg-blue-500 text-white ring-4 ring-blue-200 shadow-lg"
                                        : isCompleted
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-200 text-gray-400"
                                }`}
                            >
                                {step.icon}
                            </div>

                            {/* Timeline content */}
                            <div
                                className={`flex-1 pt-1 transition-colors ${
                                    isFutureStep ? "opacity-50" : ""
                                }`}
                            >
                                <p
                                    className={`font-semibold text-sm ${
                                        isActive
                                            ? "text-blue-600"
                                            : isCompleted
                                                ? "text-green-600"
                                                : "text-gray-400"
                                    }`}
                                >
                                    {step.label}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {step.description}
                                </p>

                                {/* Timestamp for completed steps */}
                                {(isCompleted || isActive) && (
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        {isActive && order.updatedAt
                                            ? new Date(order.updatedAt).toLocaleString("vi-VN")
                                            : isCompleted && order.updatedAt
                                                ? new Date(order.updatedAt).toLocaleString("vi-VN")
                                                : ""}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Rejection reason if rejected */}
            {order.status === OrderDetailProjectionStatus.REJECTED &&
                order.rejectionReason && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-semibold text-red-700 mb-1">
                            Lý do từ chối:
                        </p>
                        <p className="text-sm text-red-600">{order.rejectionReason}</p>
                    </div>
                )}
        </div>
    );
};

// ============================================================================
// Component: Loading Skeleton
// ============================================================================
const TrackingLoadingSkeleton = () => (
    <Card className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="space-y-3">
            <Skeleton className="h-8 w-40 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Timeline skeleton */}
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32 rounded-lg" />
                        <Skeleton className="h-3 w-48 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>

        {/* Details skeleton */}
        <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
            </div>
        </div>
    </Card>
);

// ============================================================================
// Component: Error Card
// ============================================================================
const ErrorCard = ({
                       trackingCode,
                       onRetry,
                   }: {
    trackingCode: string;
    onRetry: () => void;
}) => (
    <Card className="p-6 text-center space-y-4">
        <div className="flex justify-center">
            <LucideXCircle className="w-16 h-16 text-destructive opacity-50" />
        </div>
        <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Không tìm thấy đơn hàng</h3>
            <p className="text-sm text-muted-foreground">
                Mã vận đơn <span className="font-mono font-semibold">{trackingCode}</span> không tồn tại trong hệ thống.
            </p>
            <p className="text-xs text-muted-foreground">
                Vui lòng kiểm tra lại mã vận đơn và thử lại.
            </p>
        </div>
        <Button onClick={onRetry} variant="outline" size="sm">
            Thử lại
        </Button>
    </Card>
);

// ============================================================================
// Main Component: OrderTrackingPage
// ============================================================================
const OrderTrackingPage = ({search}: {search?: string}) => {
    const router = useRouter()
    const [content, setContent] = useState<OrderSummaryProjection|undefined>(undefined);
    const [inputValue, setInputValue] = useState(search || "");
    // Data fetching
    const { data: orderResponse, isLoading, isError, refetch } = useGetOrderByTrackingCode(inputValue);

    const order = orderResponse?.data;

    // ========== Initialize with URL parameter ==========
    useEffect(() => {
        const handler = setTimeout(() => {
            router.navigate({
                to: "/orders/tracking",
                search: {search: inputValue || undefined},
                replace: true // Replaces history entry so "Back" button isn't clogged with search steps
            });
        }, 500);

        return () => clearTimeout(handler);
    }, [inputValue, router]);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setContent(undefined);
    }, [search]);
    useEffect(() => {
        const newContent = orderResponse?.data;
        if (newContent) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setContent(newContent);
        }
    }, [orderResponse]);
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
                <div className="max-w-3xl mx-auto w-full">
                    {/* Show results only after search */}
                    {content ? (
                        <>
                            {isLoading ? (
                                <TrackingLoadingSkeleton />
                            ) : isError || !order ? (
                                <ErrorCard trackingCode={inputValue} onRetry={refetch} />
                            ) : (
                                <Card className="overflow-hidden">
                                    {/* Order Summary Header */}
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-b">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="space-y-1">
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    Tracking Code
                                                </p>
                                                <p className="text-xl sm:text-2xl font-bold font-mono text-gray-900">
                                                    {order.trackingCode}
                                                </p>
                                            </div>
                                            <Badge
                                                className={`${getStatusBadgeColor(order.status)} w-fit px-3 py-1 text-xs sm:text-sm font-semibold`}
                                            >
                                                {getStatusLabel(order.status)}
                                            </Badge>
                                        </div>

                                        {/* Created date */}
                                        {order.createdAt && (
                                            <p className="text-xs text-muted-foreground mt-3">
                                                Created at: {new Date(order.createdAt).toLocaleString("en-US")}
                                            </p>
                                        )}
                                    </div>

                                    {/* Timeline Section */}
                                    <div className="p-4 sm:p-6 border-b bg-white">
                                        <h2 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                            <LuPackage size={18} />
                                            Delivery Status
                                        </h2>
                                        <TrackingTimeline order={order} />
                                    </div>

                                    {/* Package & Shipping Details */}
                                    <div className="p-4 sm:p-6">
                                        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <LuMapPin size={18} />
                                            Order Details
                                        </h2>

                                        {/* Sender & Recipient */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            {/* Sender */}
                                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                                <p className="text-xs text-muted-foreground font-semibold">
                                                    Sender
                                                </p>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-muted-foreground">👤</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">
                                                                {order.senderName || "N/A"}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {order.senderPhone && (
                                                                    <span className="flex items-center gap-1">
                                                                        <LuPhone size={12} />
                                                                        {maskPhoneNumber(order.senderPhone)}
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        📍 {formatAddress(order.senderAddress)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Recipient */}
                                            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                                <p className="text-xs text-muted-foreground font-semibold">
                                                    Recipient
                                                </p>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-muted-foreground">👤</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">
                                                                {order.recipientName || "N/A"}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {order.recipientPhone && (
                                                                    <span className="flex items-center gap-1">
                                                                        <LuPhone size={12} />
                                                                        {maskPhoneNumber(order.recipientPhone)}
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        📍 {formatAddress(order.recipientAddress)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Package Details Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-xs text-muted-foreground">Service Type</p>
                                                <p className="font-semibold text-sm mt-1">
                                                    {order.type || "—"}
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-xs text-muted-foreground">Weight</p>
                                                <p className="font-semibold text-sm mt-1">
                                                    {order.weight ? `${order.weight} kg` : "—"}
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-xs text-muted-foreground">Declared Value</p>
                                                <p className="font-semibold text-sm mt-1">
                                                    {order.valueDeclared
                                                        ? `${order.valueDeclared.toLocaleString("vi-VN")} ₫`
                                                        : "—"}
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-xs text-muted-foreground">Total Fee</p>
                                                <p className="font-semibold text-sm mt-1">
                                                    {order.totalAmount
                                                        ? `${order.totalAmount.toLocaleString("vi-VN")} ₫`
                                                        : "—"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Special flags */}
                                        {(order.fragile || order.requiresSignature) && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {order.fragile && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        ⚠️ Fragile
                                                    </Badge>
                                                )}
                                                {order.requiresSignature && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        ✓ Signature Required
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        {/* Description */}
                                        {order.description && (
                                            <div className="mt-4">
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    Goods Description
                                                </p>
                                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                    {order.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* Delivery dates */}
                                        {(order.estimatedDeliveryDate ||
                                            order.actualDeliveryDate) && (
                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {order.estimatedDeliveryDate && (
                                                    <div className="bg-blue-50 p-3 rounded-lg">
                                                        <p className="text-xs text-muted-foreground">
                                                            Estimated Delivery
                                                        </p>
                                                        <p className="font-semibold text-sm mt-1">
                                                            {new Date(
                                                                order.estimatedDeliveryDate
                                                            ).toLocaleDateString("en-US")}
                                                        </p>
                                                    </div>
                                                )}
                                                {order.actualDeliveryDate && (
                                                    <div className="bg-green-50 p-3 rounded-lg">
                                                        <p className="text-xs text-muted-foreground">
                                                            Delivered At
                                                        </p>
                                                        <p className="font-semibold text-sm mt-1">
                                                            {new Date(
                                                                order.actualDeliveryDate
                                                            ).toLocaleString("en-US")}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}
                        </>
                    ) : (
                        /* Empty State */
                        <Card className="p-8 text-center space-y-4">
                            <div className="flex justify-center">
                                <LuPackage className="w-16 h-16 text-gray-300" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Enter Tracking Code
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Please enter your tracking code above to check your delivery status
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;
