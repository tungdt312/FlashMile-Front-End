import {toast} from "sonner";
import {useForm} from "@tanstack/react-form";
import {useCreateDepot, useUpdateDepot} from "../../services/depot-management/depot-management.ts";
import {Field, FieldError, FieldLabel} from "../ui/field.tsx";
import {Input} from "../ui/input.tsx";
import {Button} from "../ui/button.tsx";
import {LuLoaderCircle} from "react-icons/lu";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select.tsx";
import type {DepotResult} from "../../types";
import Map from "../mapbox.tsx";
import {useState} from "react";


interface DepotFormProps {
    initialData?: DepotResult; // Nếu có id -> Edit Mode
    onSuccess?: () => void;
}
export const AddDepotForm = ({initialData, onSuccess}: DepotFormProps) => {
    const isEditMode = !!initialData?.id;
    const [mapCoords, setMapCoords] = useState({
        lng: initialData?.lng ?? -71.06776,
        lat: initialData?.lat ?? 42.35816
    });
    // 1. Hook tạo mới
    const createDepot = useCreateDepot({
        mutation: {
            onSuccess: () => {
                toast.success("Depot created successfully!");
                onSuccess?.();
                depotForm.reset();
            },
            onError: (err) => toast.error(err.response?.data?.message || "Failed to create depot")
        }
    });

    // 2. Hook cập nhật (Giả định cấu trúc tương tự create)
    const updateDepot = useUpdateDepot({
        mutation: {
            onSuccess: () => {
                toast.success("Depot updated successfully!");
                onSuccess?.();
            },
            onError: (err) => toast.error(err.response?.data?.message || "Failed to update Depot")
        }
    });

    //const isLoading = createDepot.isPending || updateDepot.isPending;
    const depotForm = useForm({
        defaultValues: {
            name: initialData?.name ?? "",
            type: initialData?.type ?? "SOC",
            lat: initialData?.lat ?? 42.35816, // NEW
            lng: initialData?.lng ?? -71.06776, // NEW
        },
        onSubmit: async ({ value }) => {
            const payloadData = {
                ...value,
            };
            if (isEditMode) {
                updateDepot.mutate({
                    depotId: initialData?.id?.value || "",
                    data: payloadData
                });
            } else {
                createDepot.mutate({
                    data: payloadData
                });
            }
        }
    });

    const handleCoordinatesChange = (coords: { lng: number; lat: number }) => {
        setMapCoords(coords);
        // Optionally update form values
        depotForm.setFieldValue('lat', coords.lat);
        depotForm.setFieldValue('lng', coords.lng);
    };
    return (
        <form
            id="depot-form"
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                depotForm.handleSubmit();
            }}
            className="flex flex-col w-full gap-4"
        >
            {/* Field: Role Name */}
            <depotForm.Field
                name="name"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor={field.name}>Depot Name</FieldLabel>
                        <Input
                            id={field.name}
                            autoComplete="off"
                            placeholder="e.g. Depot"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {field.state.meta.errors.length > 0 && (
                            <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                        )}
                    </Field>
                )}
            />

            {/* Field: Description */}
            <depotForm.Field
                name="type"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor={field.name}>Depot type</FieldLabel>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder={"Depot type"} defaultValue={"SOC"}/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={"SOC"}>SOC</SelectItem>
                                <SelectItem value={"BGD"}>BGD</SelectItem>
                            </SelectContent>
                        </Select>
                        {field.state.meta.errors.length > 0 && (
                            <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                        )}
                    </Field>
                )}
            />

            <Map initialData={{lng: mapCoords.lng, lat: mapCoords.lat }}
                 onCoordinatesChange={handleCoordinatesChange}
            />
            <Button
                type="submit"
                disabled={createDepot.isPending || updateDepot.isPending}
                className="mt-2"
            >
                {(createDepot.isPending || updateDepot.isPending) && <LuLoaderCircle className="mr-2 animate-spin" />}
                {isEditMode ? "Update Depot" : "Create Depot"}
            </Button>
        </form>
    )
}
