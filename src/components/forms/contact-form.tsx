import z from "zod";
import type {ContactId, CreateContactRequest} from "../../types";
import {useQueryClient} from "@tanstack/react-query";
import {
    getGetMyContactsQueryKey,
    useCreateContact,
    useUpdateContact
} from "../../services/recipient-contacts/recipient-contacts";
import {toast} from "sonner";
import {useForm} from "@tanstack/react-form";
import {Field, FieldError, FieldLabel} from "../ui/field";
import {Input} from "../ui/input.tsx";
import {InputGroup, InputGroupTextarea} from "../ui/input-group.tsx";
import {Button} from "../ui/button.tsx";

// Validation Schema
const ContactSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    address: z.string().max(255, "Address is too long").or(z.undefined()),
    note: z.string().max(500, "Note is too long").or(z.undefined()),
});

type ContactFormValues = z.infer<typeof ContactSchema>;

interface ContactFormProps {
    initialData?: ContactFormValues & {id: ContactId} ;
    onSuccess?: () => void;
}

// ============ CONTACT FORM COMPONENT ============
export const ContactForm = ({ initialData, onSuccess }: ContactFormProps) => {
    const isEditMode = !!initialData?.id;
    const queryClient = useQueryClient();

    const createContact = useCreateContact({
        mutation: {
            onSuccess: () => {
                toast.success("Contact added successfully!");
                queryClient.invalidateQueries({ queryKey: getGetMyContactsQueryKey() });
                onSuccess?.();
                contactForm.reset();
            },
            onError: () => {
                toast.error("Failed to create contact");
            },
        },
    });

    const updateContact = useUpdateContact({
        mutation: {
            onSuccess: () => {
                toast.success("Contact updated successfully!");
                queryClient.invalidateQueries({ queryKey: getGetMyContactsQueryKey() });
                onSuccess?.();
            },
            onError: () => {
                toast.error("Failed to update contact");
            },
        },
    });

    const isLoading = createContact.isPending || updateContact.isPending;

    const contactForm = useForm({
        defaultValues: {
            name: initialData?.name ?? "",
            phoneNumber: initialData?.phoneNumber ?? "",
            address: initialData?.address,
            note: initialData?.note,
        },
        validators: {
            onSubmit: ContactSchema,
        },
        onSubmit: async ({ value }) => {
            if (isEditMode && initialData?.id.value) {
                updateContact.mutate({
                    contactId:  initialData!.id!.value ,
                    data: value as CreateContactRequest,
                });
            } else {
                createContact.mutate({
                    data: value as CreateContactRequest,
                });
            }
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                contactForm.handleSubmit();
            }}
            className="flex flex-col w-full gap-4"
        >
            {/* Name Field */}
            <contactForm.Field
                name="name"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <Input
                            id="name"
                            placeholder="e.g. John Doe"
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

            {/* Phone Number Field */}
            <contactForm.Field
                name="phoneNumber"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
                        <Input
                            id="phoneNumber"
                            placeholder="e.g. +84 123 456 789"
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

            {/* Address Field */}
            <contactForm.Field
                name="address"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="address">Address (Optional)</FieldLabel>
                        <InputGroup>
                            <Input
                                id="address"
                                placeholder="e.g. 123 Main St, Hanoi"
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

            {/* Note Field */}
            <contactForm.Field
                name="note"
                children={(field) => (
                    <Field>
                        <FieldLabel htmlFor="note">Note (Optional)</FieldLabel>
                        <InputGroup>
                            <InputGroupTextarea
                                id="note"
                                placeholder="Add any notes about this contact..."
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                disabled={isLoading}
                                rows={3}
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
                    isEditMode ? "Update Contact" : "Add Contact"
                )}
            </Button>
        </form>
    );
};
