
import {Button} from "../ui/button.tsx";
import {Field, FieldError, FieldLabel} from "../ui/field.tsx";
import {Input} from "../ui/input.tsx";
import {InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea} from "../ui/input-group.tsx";
import z from "zod";
import {useCreateRole, useUpdateRole} from "../../services/role/role.ts";
import {toast} from "sonner";
import {useForm} from "@tanstack/react-form";
import {LuLoaderCircle} from "react-icons/lu";


const RoleSchema = z.object({
    name: z.string().min(1, "Role name is required"),
    description: z.string().max(200, "Description cannot exceed 200 characters"),
});

// Định nghĩa kiểu dữ liệu cho Role
type RoleFormValues = z.infer<typeof RoleSchema>;
interface RoleFormProps {
    initialData?: RoleFormValues & { id: string }; // Nếu có id -> Edit Mode
    onSuccess?: () => void;
}

const RoleForm = ({ initialData, onSuccess }: RoleFormProps) => {

    const isEditMode = !!initialData?.id;

    // 1. Hook tạo mới
    const createRole = useCreateRole({
        mutation: {
            onSuccess: () => {
                toast.success("Role created successfully!");
                onSuccess?.();
                roleForm.reset();
            },
            onError: (err) => toast.error(err.response?.data?.message || "Failed to create role")
        }
    });

    // 2. Hook cập nhật (Giả định cấu trúc tương tự create)
    const updateRole = useUpdateRole({
        mutation: {
            onSuccess: () => {
                toast.success("Role updated successfully!");
                onSuccess?.();
            },
            onError: (err) => toast.error(err.response?.data?.message || "Failed to update role")
        }
    });

    const isLoading = createRole.isPending || updateRole.isPending;

    // 3. TanStack Form Instance
    const roleForm = useForm({
        defaultValues: {
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
        },
        validators: {
            onSubmit: RoleSchema,
        },
        onSubmit: async ({ value }) => {
            if (isEditMode) {
                updateRole.mutate({
                    id: initialData.id,
                    data: { ...value, default: false }
                });
            } else {
                createRole.mutate({
                    data: { ...value, isDefault: false }
                });
            }
        }
    });
    return (
        <form
            id="role-form"
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                roleForm.handleSubmit();
            }}
            className="flex flex-col w-full gap-4"
        >
            {/* Field: Role Name */}
            <roleForm.Field
                name="name"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor={field.name}>Role Name</FieldLabel>
                        <Input
                            id={field.name}
                            autoComplete="off"
                            placeholder="e.g. Deliverer"
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
            <roleForm.Field
                name="description"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor={field.name}>Role Description</FieldLabel>
                        <InputGroup>
                            <InputGroupTextarea
                                id={field.name}
                                placeholder="Describe the permissions and responsibilities..."
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <InputGroupAddon align="block-end">
                                <InputGroupText
                                    className={field.state.value.length > 200 ? "text-destructive" : ""}>
                                    {field.state.value.length}/200
                                </InputGroupText>
                            </InputGroupAddon>
                        </InputGroup>
                        {field.state.meta.errors.length > 0 && (
                            <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                        )}
                    </Field>
                )}
            />

            <Button
                type="submit"
                disabled={isLoading}
                className="mt-2"
            >
                {isLoading && <LuLoaderCircle className="mr-2 animate-spin" />}
                {isEditMode ? "Update Role" : "Create Role"}
            </Button>
        </form>
    );
}
export default RoleForm
