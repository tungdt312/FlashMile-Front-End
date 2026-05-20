// src/components/forms/create-order-form.tsx
import z from "zod";
import {useEffect} from "react";
import type {CreateOrderCommand, ProvinceSummaryProjection} from "../../types";
import {CreateOrderCommandType} from "../../types";
import {useQueryClient} from "@tanstack/react-query";
import {useAuthStore} from "../../lib/global";
import {toast} from "sonner";
import {useForm} from "@tanstack/react-form";
import {useRouter} from "@tanstack/react-router";
import {Field, FieldError, FieldLabel} from "../ui/field";
import {Input} from "../ui/input.tsx";
import {InputGroup, InputGroupTextarea} from "../ui/input-group.tsx";
import {Button} from "../ui/button.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select.tsx";
import {Card} from "../ui/card.tsx";
import {Switch} from "../ui/switch.tsx";
import {LuLoaderCircle} from "react-icons/lu";
import {useGetAllProvinces} from "../../services/province-management/province-management.ts";
import {useGetAllWards} from "../../services/ward-management/ward-management.ts";
import {getGetAllOrdersQueryKey, useCreateOrder} from "../../services/order-management/order-management.ts";

// Validation Schema
const CreateOrderSchema = z.object({
    trackingCode: z.string().catch(""),
    type: z.enum(CreateOrderCommandType),
    customerId: z.string().catch(""),
    senderId: z.string().catch(""),
    senderName: z.string().min(1, "Sender name is required"),
    senderPhone: z.string().min(1, "Sender phone is required"),
    senderAddress: z.string().min(1, "Sender address is required"),
    senderWardId: z.string().min(1, "Sender ward is required"),
    senderProvinceId: z.string().min(1, "Sender province is required"),
    recipientName: z.string().min(1, "Recipient name is required"),
    recipientPhone: z.string().min(1, "Recipient phone is required"),
    recipientAddress: z.string().min(1, "Recipient address is required"),
    recipientWardId: z.string().min(1, "Recipient ward is required"),
    recipientProvinceId: z.string().min(1, "Recipient province is required"),
    description: z.string().catch(""),
    weight: z.number().min(0, "Weight must be positive").catch(0),
    dimLength: z.number().min(0, "Length must be positive").catch(0),
    dimWidth: z.number().min(0, "Width must be positive").catch(0),
    dimHeight: z.number().min(0, "Height must be positive").catch(0),
    valueDeclared: z.number().min(0, "Value must be positive").catch(0),
    shippingFee: z.number().min(0, "Shipping fee must be positive").catch(0),
    insuranceFee: z.number().min(0, "Insurance fee must be positive").catch(0),
    fragile: z.boolean().catch(false),
    requiresSignature: z.boolean().catch(false),
});

interface CreateOrderFormProps {
    onSuccess?: () => void;
}

const SERVICE_TYPES = [
    {label: "Express", value: CreateOrderCommandType.EXPRESS},
    {label: "Standard", value: CreateOrderCommandType.STANDARD},
    {label: "Economy", value: CreateOrderCommandType.ECONOMY},
];

// ============ CREATE ORDER FORM COMPONENT ============
export const CreateOrderForm = ({onSuccess}: CreateOrderFormProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const {user} = useAuthStore();
    const orderForm = useForm({
        defaultValues: {
            trackingCode: "",
            type: "",
            customerId: user?.id ?? "",
            senderId: user?.id ?? "",
            senderName: user?.fullName ?? "",
            senderPhone: user?.phoneNumber ?? "",
            senderAddress: "",
            senderWardId: "",
            senderProvinceId: "",
            recipientName: "",
            recipientPhone: "",
            recipientAddress: "",
            recipientWardId: "",
            recipientProvinceId: "",
            description: "",
            weight: 0,
            dimLength: 0,
            dimWidth: 0,
            dimHeight: 0,
            valueDeclared: 0,
            shippingFee: 0,
            insuranceFee: 0,
            fragile: false,
            requiresSignature: false,
        },
        validators: {
            onSubmit: CreateOrderSchema,
        },
        onSubmit: async ({value}) => {
            createOrder.mutate({
                data: value as CreateOrderCommand,
            });
        },
    });

    // Fetch all provinces
    const {data: provincesData, isLoading: provincesLoading} = useGetAllProvinces({
        page: 0,
        size: 100
    });
    const provinces = (provincesData?.data?.content || []) as ProvinceSummaryProjection[];

    // Fetch wards - separate for sender and recipient
    const {data: senderWardsData, refetch: senderWardRefetch, isLoading: senderWardsLoading} = useGetAllWards(
        orderForm.getFieldValue("senderProvinceId")
            ? {
                page: 0,
                size: 100,
                filter: `provinceId==${orderForm.getFieldValue("senderProvinceId")}`
            }
            : {
                page: 0,
                size: 100
            }
    );

    const {data: recipientWardsData, refetch: recipientWardRefetch, isLoading: recipientWardsLoading} = useGetAllWards(
        orderForm.getFieldValue("recipientProvinceId")
            ? {
                page: 0,
                size: 100,
                filter: `provinceId==${orderForm.getFieldValue("recipientProvinceId")}`
            }
            : {
                page: 0,
                size: 100
            }
    );

    const createOrder = useCreateOrder({
        mutation: {
            onSuccess: () => {
                toast.success("Order created successfully!");
                queryClient.invalidateQueries({queryKey: getGetAllOrdersQueryKey()});
                onSuccess?.();
                orderForm.reset();
                router.navigate({to: "/orders"});
            },
            onError: () => {
                toast.error("Failed to create order");
            },
        },
    });

    const isLoading = createOrder.isPending;


    // Auto-fill sender info from auth store on mount
    useEffect(() => {
        if (user) {
            orderForm.setFieldValue("customerId", user.id ?? "");
            orderForm.setFieldValue("senderId", user.id ?? "");
            orderForm.setFieldValue("senderName", user.fullName ?? "");
            orderForm.setFieldValue("senderPhone", user.phoneNumber ?? "");
        }
    }, [user]);

    useEffect(() => {
        senderWardRefetch()
    }, [orderForm.getFieldValue("senderProvinceId")]);
    useEffect(() => {
        recipientWardRefetch()
    }, [orderForm.getFieldValue("recipientProvinceId")]);
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                orderForm.handleSubmit();
            }}
            className="flex flex-col w-full gap-6 pb-8"
        >
            {/* ==================== SECTION 1: SHIPPING SERVICE ==================== */}
            <Card className="px-6">
                <h3 className="text-lg font-semibold mb-4">Shipping Service</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tracking Code */}
                    <orderForm.Field
                        name="trackingCode"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="trackingCode">Tracking Code (Optional)</FieldLabel>
                                <Input
                                    id="trackingCode"
                                    placeholder="e.g. TRK-2025-001"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    disabled={isLoading}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />

                    {/* Service Type */}
                    <orderForm.Field
                        name="type"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="type">Service Type *</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(e) => field.handleChange(e as CreateOrderCommandType)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select service type"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SERVICE_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                </div>
            </Card>

            {/* ==================== SECTION 2: SENDER INFORMATION (Auto-filled from Auth Store) ==================== */}
            <Card className="px-6">
                <h3 className="text-lg font-semibold mb-4">Sender Information</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Auto-filled from your profile. Modify address and location details as needed.
                </p>

                {/* Sender Name & Phone (Disabled) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <orderForm.Field
                        name="senderName"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="senderName">Name (Auto-filled) *</FieldLabel>
                                <Input
                                    id="senderName"
                                    value={field.state.value}
                                    disabled
                                    className="bg-muted"
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />

                    <orderForm.Field
                        name="senderPhone"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="senderPhone">Phone (Auto-filled) *</FieldLabel>
                                <Input
                                    id="senderPhone"
                                    value={field.state.value}
                                    disabled
                                    className="bg-muted"
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                </div>

                {/* Sender Address */}
                <div className="mb-4">
                    <orderForm.Field
                        name="senderAddress"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="senderAddress">Address *</FieldLabel>
                                <InputGroup>
                                    <InputGroupTextarea
                                        id="senderAddress"
                                        placeholder="e.g. 123 Main Street"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={isLoading}
                                        rows={2}
                                    />
                                </InputGroup>
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                </div>

                {/* Sender Province & Ward */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <orderForm.Field
                        name="senderProvinceId"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="senderProvinceId">Province *</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={field.handleChange}
                                    disabled={isLoading || provincesLoading}
                                >
                                    <SelectTrigger id="senderProvinceId">
                                        <SelectValue placeholder="Select province"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {provinces.map((province) => (
                                            <SelectItem key={province.id} value={province.id || ""}>
                                                {province.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />

                    <orderForm.Field
                        name="senderWardId"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="senderWardId">Ward *</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={field.handleChange}
                                    disabled={isLoading || senderWardsLoading || !orderForm.getFieldValue("senderProvinceId")}
                                >
                                    <SelectTrigger id="senderWardId">
                                        <SelectValue
                                            placeholder={orderForm.getFieldValue("senderProvinceId") ? "Select ward" : "Select province first"}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {senderWardsData?.data?.content?.map((ward) => {
                                            if (ward.id) return (
                                                <SelectItem key={ward.id} value={ward.id}>
                                                    {ward.name}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                </div>
            </Card>

            {/* ==================== SECTION 3: RECIPIENT INFORMATION ==================== */}
            <Card className="px-6">
                <h3 className="text-lg font-semibold mb-4">Recipient Information</h3>

                {/* Recipient Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <orderForm.Field
                        name="recipientName"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="recipientName">Name *</FieldLabel>
                                <Input
                                    id="recipientName"
                                    placeholder="e.g. Jane Smith"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    disabled={isLoading}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />

                    <orderForm.Field
                        name="recipientPhone"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="recipientPhone">Phone *</FieldLabel>
                                <Input
                                    id="recipientPhone"
                                    placeholder="e.g. +84 987 654 321"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    disabled={isLoading}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                </div>

                {/* Recipient Address */}
                <div className="mb-4">
                    <orderForm.Field
                        name="recipientAddress"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="recipientAddress">Address *</FieldLabel>
                                <InputGroup>
                                    <InputGroupTextarea
                                        id="recipientAddress"
                                        placeholder="e.g. 456 Oak Avenue"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={isLoading}
                                        rows={2}
                                    />
                                </InputGroup>
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                </div>

                {/* Recipient Province & Ward */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <orderForm.Field
                        name="recipientProvinceId"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="recipientProvinceId">Province *</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={field.handleChange}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="recipientProvinceId">
                                        <SelectValue placeholder="Select province"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {provinces.map((province) => (
                                            <SelectItem key={province.id} value={province.id || ""}>
                                                {province.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />

                    <orderForm.Field
                        name="recipientWardId"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="recipientWardId">Ward *</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={field.handleChange}
                                    disabled={isLoading || recipientWardsLoading || !orderForm.getFieldValue("recipientProvinceId")}
                                >
                                    <SelectTrigger id="recipientWardId">
                                        <SelectValue
                                            placeholder={orderForm.getFieldValue("recipientProvinceId") ? "Select ward" : "Select province first"}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recipientWardsData?.data?.content?.map((ward) => {
                                            if (ward.id) return (
                                                <SelectItem key={ward.id} value={ward.id}>
                                                    {ward.name}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                </div>
            </Card>

            {/* ==================== SECTION 4: PACKAGE DETAILS & LOGISTICS ==================== */}
            <Card className="px-6">
                <h3 className="text-lg font-semibold mb-4">Package Details</h3>

                {/* Description */}
                <div className="mb-4">
                    <orderForm.Field
                        name="description"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="description">Description (Optional)</FieldLabel>
                                <InputGroup>
                                    <InputGroupTextarea
                                        id="description"
                                        placeholder="e.g. Books, electronics, clothing..."
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={isLoading}
                                        rows={2}
                                    />
                                </InputGroup>
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                </div>

                {/* Dimensions & Weight */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <orderForm.Field
                        name="weight"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="weight">Weight (kg)</FieldLabel>
                                <Input
                                    id="weight"
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    value={field.state.value || ""}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                                    disabled={isLoading}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />

                    <orderForm.Field
                        name="dimLength"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="dimLength">Length (cm)</FieldLabel>
                                <Input
                                    id="dimLength"
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    value={field.state.value || ""}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                                    disabled={isLoading}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />

                    <orderForm.Field
                        name="dimWidth"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="dimWidth">Width (cm)</FieldLabel>
                                <Input
                                    id="dimWidth"
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    value={field.state.value || ""}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                                    disabled={isLoading}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />

                    <orderForm.Field
                        name="dimHeight"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="dimHeight">Height (cm)</FieldLabel>
                                <Input
                                    id="dimHeight"
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    value={field.state.value || ""}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                                    disabled={isLoading}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                </div>

                {/* Fees & Values */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <orderForm.Field
                        name="valueDeclared"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="valueDeclared">Declared Value (₫)</FieldLabel>
                                <Input
                                    id="valueDeclared"
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    value={field.state.value || ""}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                                    disabled={isLoading}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />

                    <orderForm.Field
                        name="shippingFee"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="shippingFee">Shipping Fee (₫)</FieldLabel>
                                <Input
                                    id="shippingFee"
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    value={field.state.value || ""}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                                    disabled={isLoading}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />

                    <orderForm.Field
                        name="insuranceFee"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="insuranceFee">Insurance Fee (₫)</FieldLabel>
                                <Input
                                    id="insuranceFee"
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    value={field.state.value || ""}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                                    disabled={isLoading}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                </div>
            </Card>

            {/* ==================== SECTION 5: ADDITIONAL OPTIONS ==================== */}
            <Card className="px-6">
                <h3 className="text-lg font-semibold mb-4">Additional Options</h3>

                <div className="flex flex-col gap-4">
                    {/* Fragile */}
                    <orderForm.Field
                        name="fragile"
                        children={(field) => (
                            <div className="flex items-center justify-between gap-4">
                                <FieldLabel htmlFor="fragile">Fragile Package</FieldLabel>
                                <Switch
                                    id="fragile"
                                    checked={field.state.value}
                                    onCheckedChange={field.handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                    />

                    {/* Requires Signature */}
                    <orderForm.Field
                        name="requiresSignature"
                        children={(field) => (
                            <div className="flex items-center justify-between gap-4">
                                <FieldLabel htmlFor="requiresSignature">Requires Signature</FieldLabel>
                                <Switch
                                    id="requiresSignature"
                                    checked={field.state.value}
                                    onCheckedChange={field.handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                    />
                </div>
            </Card>

            {/* ==================== SUBMIT BUTTON ==================== */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="submit"
                    disabled={isLoading}
                    size="lg"
                    className="flex-1"
                >
                    {isLoading && <LuLoaderCircle className="animate-spin"/>}
                    {isLoading ? "Creating Order..." : "Create Order"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={isLoading}
                    onClick={() => router.navigate({to: "/orders"})}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default CreateOrderForm;
