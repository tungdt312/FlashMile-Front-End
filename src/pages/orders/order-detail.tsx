/**
 * Role-Based Order Detail Page Component
 * Features:
 * - Role-based conditional rendering of action buttons
 * - Multiple mutation integrations with Orval hooks
 * - Dialogs for complex actions
 * - Responsive mobile-first layout
 * - TypeScript strict typing
 */

import {useRouter} from "@tanstack/react-router";
import {useAuthStore} from "../../lib/global";
import {
    useAssignDriver,
    useCancelOrder,
    useConfirmOrder,
    useDeleteOrder,
    useDeliverOrder,
    useGetOrderById,
    useRejectOrder,
    useStartDelivery,
    useUpdateRecipient
} from "../../services/order-management/order-management";
import {useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {useState} from "react";

// UI Components
import {Button} from "../../components/ui/button";
import {Card} from "../../components/ui/card";
import {Badge} from "../../components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../../components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle
} from "../../components/ui/alert-dialog";
import {Input} from "../../components/ui/input";
import {Textarea} from "../../components/ui/textarea";
import {Skeleton} from "../../components/ui/skeleton";
import {Field, FieldContent, FieldLabel} from "../../components/ui/field";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../components/ui/select";

// Icons
import {
    LuArrowLeft,
    LuBell,
    LuCheck,
    LuLoaderCircle,
    LuTrash2,
    LuTruck,
    LuUserCheck,
} from "react-icons/lu";

// Types
import type {OrderDetailProjection} from "../../types";
import {OrderDetailProjectionStatus} from "../../types";
import {LucideAlertTriangle, LucideEdit3, LucideXCircle} from "lucide-react";

type UserRole = "ADMIN" | "USER" | "DELIVERER";

// ============================================================================
// Component: StatusBadge
// ============================================================================
const StatusBadge = ({ status }: { status?: string }) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        [OrderDetailProjectionStatus.PENDING]: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
        [OrderDetailProjectionStatus.CONFIRMED]: { bg: "bg-blue-100", text: "text-blue-800", label: "Confirmed" },
        [OrderDetailProjectionStatus.ASSIGNED]: { bg: "bg-indigo-100", text: "text-indigo-800", label: "Assigned" },
        [OrderDetailProjectionStatus.IN_TRANSIT]: { bg: "bg-purple-100", text: "text-purple-800", label: "In Transit" },
        [OrderDetailProjectionStatus.DELIVERED]: { bg: "bg-green-100", text: "text-green-800", label: "Delivered" },
        [OrderDetailProjectionStatus.REJECTED]: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
        [OrderDetailProjectionStatus.CANCELLED]: { bg: "bg-gray-100", text: "text-gray-800", label: "Cancelled" },
    };

    const config = statusConfig[status || "PENDING"];

    return (
        <Badge className={`${config.bg} ${config.text} font-medium`}>
            {config.label}
        </Badge>
    );
};

// ============================================================================
// Component: EditRecipientDialog
// ============================================================================
interface EditRecipientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: OrderDetailProjection | undefined;
    onSubmit: (data: { recipientName: string; recipientPhone: string; recipientAddress: string }) => void;
    isLoading: boolean;
}

const EditRecipientDialog = ({ open, onOpenChange, order, onSubmit, isLoading }: EditRecipientDialogProps) => {
    const [formData, setFormData] = useState({
        recipientName: order?.recipientName || "",
        recipientPhone: order?.recipientPhone || "",
        recipientAddress: order?.recipientAddress || "",
    });

    const handleSubmit = () => {
        if (!formData.recipientName || !formData.recipientPhone || !formData.recipientAddress) {
            toast.error("All recipient fields are required");
            return;
        }
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Edit Recipient Information</DialogTitle>
                    <DialogDescription>Update the recipient details for this order.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <Field>
                        <FieldLabel htmlFor="recipient-name">Recipient Name</FieldLabel>
                        <FieldContent>
                            <Input
                                id="recipient-name"
                                value={formData.recipientName}
                                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                placeholder="Enter recipient name"
                            />
                        </FieldContent>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="recipient-phone">Recipient Phone</FieldLabel>
                        <FieldContent>
                            <Input
                                id="recipient-phone"
                                type="tel"
                                value={formData.recipientPhone}
                                onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                                placeholder="Enter recipient phone"
                            />
                        </FieldContent>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="recipient-address">Recipient Address</FieldLabel>
                        <FieldContent>
                            <Textarea
                                id="recipient-address"
                                value={formData.recipientAddress}
                                onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                                placeholder="Enter recipient address"
                            />
                        </FieldContent>
                    </Field>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2">
                        {isLoading && <LuLoaderCircle className="animate-spin" size={16} />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ============================================================================
// Component: AssignDelivererDialog
// ============================================================================
interface AssignDelivererDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { driverId: string; depotId: string }) => void;
    isLoading: boolean;
}

const AssignDelivererDialog = ({ open, onOpenChange, onSubmit, isLoading }: AssignDelivererDialogProps) => {
    const [formData, setFormData] = useState({ driverId: "", depotId: "" });

    const handleSubmit = () => {
        if (!formData.driverId || !formData.depotId) {
            toast.error("Please select a deliverer and depot");
            return;
        }
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Assign Deliverer</DialogTitle>
                    <DialogDescription>Assign a deliverer and select the depot for this order.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <Field>
                        <FieldLabel htmlFor="driver-select">Select Deliverer</FieldLabel>
                        <FieldContent>
                            <Select value={formData.driverId} onValueChange={(value) => setFormData({ ...formData, driverId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a deliverer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Note: Replace with actual useGetAllDeliverers hook if available */}
                                    <SelectItem value="driver-1">Driver 001</SelectItem>
                                    <SelectItem value="driver-2">Driver 002</SelectItem>
                                    <SelectItem value="driver-3">Driver 003</SelectItem>
                                </SelectContent>
                            </Select>
                        </FieldContent>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="depot-select">Select Depot</FieldLabel>
                        <FieldContent>
                            <Select value={formData.depotId} onValueChange={(value) => setFormData({ ...formData, depotId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a depot" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Note: Replace with actual useGetAllDepots hook if available */}
                                    <SelectItem value="depot-1">Depot HCM</SelectItem>
                                    <SelectItem value="depot-2">Depot Hanoi</SelectItem>
                                    <SelectItem value="depot-3">Depot DN</SelectItem>
                                </SelectContent>
                            </Select>
                        </FieldContent>
                    </Field>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2">
                        {isLoading && <LuLoaderCircle className="animate-spin" size={16} />}
                        Assign
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ============================================================================
// Component: RejectReasonDialog
// ============================================================================
interface RejectReasonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (reason: string) => void;
    isLoading: boolean;
}

const RejectReasonDialog = ({ open, onOpenChange, onSubmit, isLoading }: RejectReasonDialogProps) => {
    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }
        onSubmit(reason);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Reject Order</DialogTitle>
                    <DialogDescription>Please provide a reason for rejecting this order.</DialogDescription>
                </DialogHeader>

                <Field>
                    <FieldLabel htmlFor="rejection-reason">Rejection Reason</FieldLabel>
                    <FieldContent>
                        <Textarea
                            id="rejection-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter rejection reason"
                            rows={4}
                        />
                    </FieldContent>
                </Field>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2">
                        {isLoading && <LuLoaderCircle className="animate-spin" size={16} />}
                        Reject Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ============================================================================
// Main Component: OrderDetailPage
// ============================================================================
const OrderDetailPage = ({orderId}: {orderId: string}) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    // Dialog states
    const [editRecipientOpen, setEditRecipientOpen] = useState(false);
    const [assignDelivererOpen, setAssignDelivererOpen] = useState(false);
    const [rejectReasonOpen, setRejectReasonOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // Determine user role
    const userRole: UserRole = (user?.roleName as UserRole) || "USER";

    // ========== Data Fetching ==========
    const { data: orderResponse, isLoading, isError } = useGetOrderById(orderId);
    const order = orderResponse?.data;

    // ========== Mutations ==========
    const confirmOrderMutation = useConfirmOrder({
        mutation: {
            onSuccess: () => {
                toast.success("Order confirmed successfully");
                queryClient.invalidateQueries({ queryKey: ["/api/v1/orders/" + orderId] });
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || "Failed to confirm order");
            },
        },
    });

    const assignDriverMutation = useAssignDriver({
        mutation: {
            onSuccess: () => {
                toast.success("Deliverer assigned successfully");
                setAssignDelivererOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/v1/orders/" + orderId] });
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || "Failed to assign deliverer");
            },
        },
    });

    const startDeliveryMutation = useStartDelivery({
        mutation: {
            onSuccess: () => {
                toast.success("Delivery started successfully");
                queryClient.invalidateQueries({ queryKey: ["/api/v1/orders/" + orderId] });
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || "Failed to start delivery");
            },
        },
    });

    const deliverOrderMutation = useDeliverOrder({
        mutation: {
            onSuccess: () => {
                toast.success("Order delivered successfully");
                queryClient.invalidateQueries({ queryKey: ["/api/v1/orders/" + orderId] });
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || "Failed to deliver order");
            },
        },
    });

    const rejectOrderMutation = useRejectOrder({
        mutation: {
            onSuccess: () => {
                toast.success("Order rejected successfully");
                setRejectReasonOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/v1/orders/" + orderId] });
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || "Failed to reject order");
            },
        },
    });

    const cancelOrderMutation = useCancelOrder({
        mutation: {
            onSuccess: () => {
                toast.success("Order cancelled successfully");
                queryClient.invalidateQueries({ queryKey: ["/api/v1/orders/" + orderId] });
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || "Failed to cancel order");
            },
        },
    });

    const updateRecipientMutation = useUpdateRecipient({
        mutation: {
            onSuccess: () => {
                toast.success("Recipient information updated successfully");
                setEditRecipientOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/v1/orders/" + orderId] });
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || "Failed to update recipient");
            },
        },
    });

    const deleteOrderMutation = useDeleteOrder({
        mutation: {
            onSuccess: () => {
                toast.success("Order deleted successfully");
                setDeleteConfirmOpen(false);
                router.navigate({ to: "/orders" });
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || "Failed to delete order");
            },
        },
    });

    // ========== Action Handlers ==========
    const handleConfirmOrder = () => {
        confirmOrderMutation.mutate({ orderId });
    };

    const handleAssignDeliverer = (data: { driverId: string; depotId: string }) => {
        assignDriverMutation.mutate({
            orderId,
            data: {
                driverId: data.driverId,
                depotId: data.depotId,
            },
        });
    };

    const handleStartDelivery = () => {
        startDeliveryMutation.mutate({ orderId });
    };

    const handleDeliverOrder = () => {
        deliverOrderMutation.mutate({
            orderId,
            data: {
                deliveryDate: new Date().toISOString(),
            },
        });
    };

    const handleRejectOrder = (reason: string) => {
        rejectOrderMutation.mutate({
            orderId,
            data: { rejectionReason: reason },
        });
    };

    const handleCancelOrder = () => {
        cancelOrderMutation.mutate({ orderId });
    };

    const handleUpdateRecipient = (data: { recipientName: string; recipientPhone: string; recipientAddress: string }) => {
        updateRecipientMutation.mutate({
            orderId,
            data,
        });
    };

    const handleDeleteOrder = () => {
        deleteOrderMutation.mutate({ orderId });
    };

    // ========== Role-Based Permission Helpers ==========
    const canConfirm = ["USER", "ADMIN"].includes(userRole);
    const canAssign = userRole === "ADMIN";
    const canStartDelivery = ["DELIVERER", "ADMIN"].includes(userRole);
    const canDeliver = ["DELIVERER", "ADMIN"].includes(userRole);
    const canReject = userRole === "ADMIN";
    const canCancel = ["USER", "ADMIN"].includes(userRole);
    const canUpdateRecipient = ["USER", "ADMIN"].includes(userRole);
    const canDelete = userRole === "ADMIN";

    // ========== Render Loading State ==========
    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex flex-col bg-slate-50 p-4">
                <div className="max-w-4xl mx-auto w-full space-y-6">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    // ========== Render Error State ==========
    if (isError || !order) {
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
                    <p className={"heading text-center w-full"}>Order Detail</p>
                    <Button size={"icon-lg"} variant={"outline"}
                            className={"size-10 ring-0 rounded-full text-foreground"} onClick={() => {
                    }}>
                        <LuBell size={20}/>
                    </Button>
                </div>
                <div className={"w-full flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-lg"}>
                    <Card className="p-6 text-center">
                        <LucideAlertTriangle className="mx-auto mb-4 text-destructive" size={32} />
                        <h2 className="text-lg font-semibold mb-2">Order Not Found</h2>
                        <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist or couldn't be loaded.</p>
                        <Button onClick={() => router.navigate({ to: "/orders" })}>Back to Orders</Button>
                    </Card>
                </div>
            </div>
        );
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
                <p className={"heading text-center w-full"}>Orders</p>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 rounded-full text-foreground"} onClick={() => {
                }}>
                    <LuBell size={20}/>
                </Button>
            </div>
            <div className={"w-full flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-lg"}>

                {/* ===== Header Summary Card ===== */}
                <Card className="p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Tracking Code</p>
                            <p className="text-xl font-bold font-mono">{order.trackingCode}</p>
                        </div>
                        <div className="flex flex-col md:items-end gap-2">
                            <StatusBadge status={order.status} />
                            <p className="text-xs text-muted-foreground">
                                {order.createdAt && new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* ===== Dynamic Action Bar ===== */}
                {(canConfirm || canAssign || canStartDelivery || canDeliver || canReject || canCancel || canUpdateRecipient || canDelete) && (
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4 text-sm">Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {canConfirm && order.status === OrderDetailProjectionStatus.PENDING && (
                                <Button
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={handleConfirmOrder}
                                    disabled={confirmOrderMutation.isPending}
                                >
                                    {confirmOrderMutation.isPending && <LuLoaderCircle className="animate-spin" size={16} />}
                                    <LuCheck size={16} />
                                    <span className="hidden sm:inline">Confirm</span>
                                </Button>
                            )}

                            {canAssign && !order.assignedDriverId && order.status !== OrderDetailProjectionStatus.DELIVERED && order.status !== OrderDetailProjectionStatus.REJECTED && order.status !== OrderDetailProjectionStatus.CANCELLED && (
                                <Button
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={() => setAssignDelivererOpen(true)}
                                    disabled={assignDriverMutation.isPending}
                                >
                                    {assignDriverMutation.isPending && <LuLoaderCircle className="animate-spin" size={16} />}
                                    <LuUserCheck size={16} />
                                    <span className="hidden sm:inline">Assign</span>
                                </Button>
                            )}

                            {canStartDelivery && order.status === OrderDetailProjectionStatus.ASSIGNED && (
                                <Button
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={handleStartDelivery}
                                    disabled={startDeliveryMutation.isPending}
                                >
                                    {startDeliveryMutation.isPending && <LuLoaderCircle className="animate-spin" size={16} />}
                                    <LuTruck size={16} />
                                    <span className="hidden sm:inline">Start</span>
                                </Button>
                            )}

                            {canDeliver && order.status === OrderDetailProjectionStatus.IN_TRANSIT && (
                                <Button
                                    size="sm"
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                    onClick={handleDeliverOrder}
                                    disabled={deliverOrderMutation.isPending}
                                >
                                    {deliverOrderMutation.isPending && <LuLoaderCircle className="animate-spin" size={16} />}
                                    <LuCheck size={16} />
                                    <span className="hidden sm:inline">Deliver</span>
                                </Button>
                            )}

                            {canReject && ([OrderDetailProjectionStatus.PENDING, OrderDetailProjectionStatus.CONFIRMED, OrderDetailProjectionStatus.ASSIGNED] as string[]).includes(order.status || '') && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="flex items-center gap-2"
                                    onClick={() => setRejectReasonOpen(true)}
                                    disabled={rejectOrderMutation.isPending}
                                >
                                    {rejectOrderMutation.isPending && <LuLoaderCircle className="animate-spin" size={16} />}
                                    <LucideXCircle size={16} />
                                    <span className="hidden sm:inline">Reject</span>
                                </Button>
                            )}

                            {canCancel && ([OrderDetailProjectionStatus.PENDING, OrderDetailProjectionStatus.CONFIRMED, OrderDetailProjectionStatus.ASSIGNED] as string[]).includes(order.status || "") && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={handleCancelOrder}
                                    disabled={cancelOrderMutation.isPending}
                                >
                                    {cancelOrderMutation.isPending && <LuLoaderCircle className="animate-spin" size={16} />}
                                    <LucideXCircle size={16} />
                                    <span className="hidden sm:inline">Cancel</span>
                                </Button>
                            )}

                            {canDelete && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteConfirmOpen(true)}
                                    disabled={deleteOrderMutation.isPending}
                                >
                                    {deleteOrderMutation.isPending && <LuLoaderCircle className="animate-spin" size={16} />}
                                    <LuTrash2 size={16} />
                                    <span className="hidden sm:inline">Delete</span>
                                </Button>
                            )}
                        </div>
                    </Card>
                )}

                {/* ===== Logistics & Package Info ===== */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Package Details</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Weight</p>
                            <p className="font-semibold">{order.weight ? `${order.weight} kg` : "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Dimensions</p>
                            <p className="font-semibold text-sm">{order.dimensions || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Value Declared</p>
                            <p className="font-semibold">{order.valueDeclared ? `$${order.valueDeclared.toFixed(2)}` : "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Type</p>
                            <p className="font-semibold">{order.type || "—"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                            <p className="text-xs text-muted-foreground">Shipping Fee</p>
                            <p className="font-semibold">${order.shippingFee?.toFixed(2) || "0.00"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Insurance Fee</p>
                            <p className="font-semibold">${order.insuranceFee?.toFixed(2) || "0.00"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-semibold">${order.totalAmount?.toFixed(2) || "0.00"}</p>
                        </div>
                    </div>

                    {(order.fragile || order.requiresSignature) && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t">
                            {order.fragile && (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <LucideAlertTriangle size={14} />
                                    Fragile
                                </Badge>
                            )}
                            {order.requiresSignature && (
                                <Badge variant="secondary">Requires Signature</Badge>
                            )}
                        </div>
                    )}

                    {order.description && (
                        <div className="pt-4 border-t">
                            <p className="text-xs text-muted-foreground mb-1">Description</p>
                            <p className="text-sm">{order.description}</p>
                        </div>
                    )}
                </Card>

                {/* ===== Sender & Recipient Info Grid ===== */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Sender Info */}
                    <Card className="p-6 space-y-3">
                        <h3 className="font-semibold text-base">Sender Information</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">Name</p>
                                <p className="font-medium">{order.senderName || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="font-medium">{order.senderPhone || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Address</p>
                                <p className="font-medium">{order.senderAddress || "—"}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Province ID</p>
                                    <p className="font-medium text-xs">{order.senderProvinceId || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Ward ID</p>
                                    <p className="font-medium text-xs">{order.senderWardId || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Recipient Info */}
                    <Card className="p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-base">Recipient Information</h3>
                            {canUpdateRecipient && (
                                <Button
                                    size="icon-xs"
                                    variant="ghost"
                                    onClick={() => setEditRecipientOpen(true)}
                                    className="text-primary"
                                >
                                    <LucideEdit3 size={16} />
                                </Button>
                            )}
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">Name</p>
                                <p className="font-medium">{order.recipientName || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="font-medium">{order.recipientPhone || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Address</p>
                                <p className="font-medium">{order.recipientAddress || "—"}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Province ID</p>
                                    <p className="font-medium text-xs">{order.recipientProvinceId || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Ward ID</p>
                                    <p className="font-medium text-xs">{order.recipientWardId || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ===== Additional Info ===== */}
                <Card className="p-6 space-y-3">
                    <h3 className="font-semibold">Additional Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {order.assignedDriverId && (
                            <div>
                                <p className="text-xs text-muted-foreground">Assigned Driver</p>
                                <p className="font-medium">{order.assignedDriverId}</p>
                            </div>
                        )}
                        {order.depotId && (
                            <div>
                                <p className="text-xs text-muted-foreground">Depot</p>
                                <p className="font-medium">{order.depotId}</p>
                            </div>
                        )}
                        {order.estimatedDeliveryDate && (
                            <div>
                                <p className="text-xs text-muted-foreground">Est. Delivery</p>
                                <p className="font-medium">{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
                            </div>
                        )}
                        {order.actualDeliveryDate && (
                            <div>
                                <p className="text-xs text-muted-foreground">Delivered On</p>
                                <p className="font-medium">{new Date(order.actualDeliveryDate).toLocaleDateString()}</p>
                            </div>
                        )}
                        {order.rejectionReason && (
                            <div className="md:col-span-3">
                                <p className="text-xs text-muted-foreground">Rejection Reason</p>
                                <p className="font-medium text-destructive">{order.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* ===== Dialogs ===== */}
            <EditRecipientDialog
                open={editRecipientOpen}
                onOpenChange={setEditRecipientOpen}
                order={order}
                onSubmit={handleUpdateRecipient}
                isLoading={updateRecipientMutation.isPending}
            />

            <AssignDelivererDialog
                open={assignDelivererOpen}
                onOpenChange={setAssignDelivererOpen}
                onSubmit={handleAssignDeliverer}
                isLoading={assignDriverMutation.isPending}
            />

            <RejectReasonDialog
                open={rejectReasonOpen}
                onOpenChange={setRejectReasonOpen}
                onSubmit={handleRejectOrder}
                isLoading={rejectOrderMutation.isPending}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Order</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this order? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogContent className="flex items-center justify-center gap-3 pt-2">
                        <LucideAlertTriangle className="text-destructive" size={24} />
                        <p className="font-semibold">Delete {order.trackingCode}?</p>
                    </AlertDialogContent>
                    <div className="flex gap-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteOrder}
                            disabled={deleteOrderMutation.isPending}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleteOrderMutation.isPending && <LuLoaderCircle className="animate-spin mr-2" size={16} />}
                            Delete
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default OrderDetailPage;
