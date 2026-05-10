// src/components/forms/vehicle-form.tsx
import z from "zod";
import type {VehicleRequest, VehicleSummaryProjection} from "../../types";
import {useQueryClient} from "@tanstack/react-query";
import {
    getGetAllVehiclesQueryKey,
    useCreateVehicle,
    useUpdateVehicle
} from "../../services/vehicle-management/vehicle-management";
import {toast} from "sonner";
import {useForm} from "@tanstack/react-form";
import {Field, FieldError, FieldLabel} from "../ui/field";
import {Input} from "../ui/input.tsx";
import {InputGroup} from "../ui/input-group.tsx";
import {Button} from "../ui/button.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "../ui/select.tsx";

// Validation Schema
const VehicleSchema = z.object({
    licensePlate: z.string().min(1, "License plate is required").toUpperCase(),
    type: z.string().min(1, "Vehicle type is required"),
    maxWeight: z.number().min(0, "Max weight must be positive"),
    maxVolume: z.number().min(0, "Max volume must be positive"),
    shipperId: z.string().or(z.undefined()),
});


interface VehicleFormProps {
    initialData?: VehicleSummaryProjection,
    onSuccess?: () => void;
}

const VEHICLE_TYPES = [
    { label: "Motorcycle", value: "MOTORCYCLE" },
    { label: "Car", value: "CAR" },
    { label: "Van", value: "VAN" },
    { label: "Truck", value: "TRUCK" },
    { label: "Pickup", value: "PICKUP" },
];

// ============ VEHICLE FORM COMPONENT ============
export const VehicleForm = ({ initialData, onSuccess }: VehicleFormProps) => {
    const isEditMode = !!initialData?.id;
    const queryClient = useQueryClient();

    const createVehicle = useCreateVehicle({
        mutation: {
            onSuccess: () => {
                toast.success("Vehicle added successfully!");
                queryClient.invalidateQueries({ queryKey: getGetAllVehiclesQueryKey() });
                onSuccess?.();
                vehicleForm.reset();
            },
            onError: () => {
                toast.error("Failed to create vehicle");
            },
        },
    });

    const updateVehicle = useUpdateVehicle({
        mutation: {
            onSuccess: () => {
                toast.success("Vehicle updated successfully!");
                queryClient.invalidateQueries({ queryKey: getGetAllVehiclesQueryKey() });
                onSuccess?.();
            },
            onError: () => {
                toast.error("Failed to update vehicle");
            },
        },
    });

    const isLoading = createVehicle.isPending || updateVehicle.isPending;

    const vehicleForm = useForm({
        defaultValues: {
            licensePlate: initialData?.licensePlate ?? "",
            type: initialData?.type ?? "",
            maxWeight: initialData?.maxWeight ?? 0,
            maxVolume: initialData?.maxVolume ?? 0,
            shipperId: initialData?.shipperId,
        },
        validators: {
            onSubmit: VehicleSchema
        },
        onSubmit: async ({ value }) => {
            if (isEditMode && initialData?.id) {
                updateVehicle.mutate({
                    id: initialData!.id!,
                    data: value as VehicleRequest,
                });
            } else {
                createVehicle.mutate({
                    data: value as VehicleRequest,
                });
            }
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                vehicleForm.handleSubmit();
            }}
            className="flex flex-col w-full gap-4"
        >
            {/* License Plate Field */}
            <vehicleForm.Field
                name="licensePlate"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="licensePlate">License Plate</FieldLabel>
                        <Input
                            id="licensePlate"
                            placeholder="e.g. ABC-123-XYZ"
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

            {/* Vehicle Type Field */}
            <vehicleForm.Field
                name="type"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="type">Vehicle Type</FieldLabel>
                        <Select value={field.state.value} onValueChange={field.handleChange} disabled={isLoading}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                            <SelectContent>
                                {VEHICLE_TYPES.map((type) => (
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

            {/* Max Weight Field */}
            <vehicleForm.Field
                name="maxWeight"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="maxWeight">Max Weight (kg) - Optional</FieldLabel>
                        <InputGroup>
                            <Input
                                id="maxWeight"
                                type="number"
                                placeholder="e.g. 5000"
                                value={field.state.value ?? ""}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                    field.handleChange(parseFloat(e.target.value))
                                }
                                disabled={isLoading}
                            />
                        </InputGroup>
                        {field.state.meta.errors.length > 0 && (
                            <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                        )}
                    </Field>
                )}
            />

            {/* Max Volume Field */}
            <vehicleForm.Field
                name="maxVolume"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="maxVolume">Max Volume (m³) - Optional</FieldLabel>
                        <InputGroup>
                            <Input
                                id="maxVolume"
                                type="number"
                                placeholder="e.g. 20"
                                value={field.state.value ?? ""}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                    field.handleChange(parseFloat(e.target.value))
                                }
                                disabled={isLoading}
                            />
                        </InputGroup>
                        {field.state.meta.errors.length > 0 && (
                            <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                        )}
                    </Field>
                )}
            />

            {/* Shipper ID Field */}
            <vehicleForm.Field
                name="shipperId"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="shipperId">Shipper ID - Optional</FieldLabel>
                        <InputGroup>
                            <Input
                                id="shipperId"
                                placeholder="e.g. Shipper UUID"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                disabled={isLoading}
                            />
                        </InputGroup>
                        {field.state.meta.errors.length > 0 && (
                            <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                        )}
                    </Field>
                )}
            />

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
            >
                {isLoading ? (
                    <>
                        <span className="animate-spin mr-2">⌛</span>
                        {isEditMode ? "Updating..." : "Adding..."}
                    </>
                ) : (
                    isEditMode ? "Update Vehicle" : "Add Vehicle"
                )}
            </Button>
        </form>
    );
};
