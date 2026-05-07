import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff, Lock, LoaderCircle } from "lucide-react";
import { useState } from "react";
import {useChangePassword} from "../../services/authentication/authentication.ts";

// Validation schema with strict password requirements
const ChangePasswordSchema = z
    .object({
        oldPassword: z.string().min(1, "Current password is required."),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters.")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter."),
        confirmPassword: z.string().min(1, "Confirm password is required."),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;

interface ChangePasswordFormProps {
    onSuccess?: () => void;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
                                                                          onSuccess,
                                                                      }) => {
    // Password visibility toggles
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // API mutation hook
    const changePasswordMutation = useChangePassword({
        mutation: {
            onSuccess: () => {
                toast.success("Password changed successfully!");
                changePasswordForm.reset();
                onSuccess?.();
            },
            onError: (err) => {
                const errorMessage =
                    err.response?.data?.message || "Failed to change password";
                toast.error(errorMessage);
            },
        },
    });

    // Form setup with TanStack Form
    const changePasswordForm = useForm({
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        } as ChangePasswordFormData,
        validators: {
            onSubmit: ChangePasswordSchema,
        },
        onSubmit: (values) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...submitData } = values.value;
            changePasswordMutation.mutate({
                data: submitData,
            });
        },
    });

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                {/* Header */}
                <div className="mb-6 flex items-center gap-2">
                    <Lock className="size-5 text-primary" />
                    <h2 className="text-lg font-semibold text-card-foreground">
                        Change Password
                    </h2>
                </div>

                {/* Form */}
                <form
                    id="change-password-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        changePasswordForm.handleSubmit();
                    }}
                    className="flex flex-col gap-4"
                >
                    {/* Old Password Field */}
                    <changePasswordForm.Field
                        name="oldPassword"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor={field.name}>Current Password</FieldLabel>
                                <div className="relative flex items-center">
                                    <Input
                                        id={field.name}
                                        autoComplete="current-password"
                                        placeholder="Enter your current password"
                                        type={showOldPassword ? "text" : "password"}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={changePasswordMutation.isPending}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                                        disabled={changePasswordMutation.isPending}
                                        aria-label={
                                            showOldPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showOldPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>
                                        {field.state.meta.errors
                                            .map((err) =>
                                                typeof err === "object" ? err.message : err
                                            )
                                            .join(", ")}
                                    </FieldError>
                                )}
                            </Field>
                        )}
                    />

                    {/* New Password Field */}
                    <changePasswordForm.Field
                        name="newPassword"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                                <div className="relative flex items-center">
                                    <Input
                                        id={field.name}
                                        autoComplete="new-password"
                                        placeholder="Enter your new password"
                                        type={showNewPassword ? "text" : "password"}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={changePasswordMutation.isPending}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                                        disabled={changePasswordMutation.isPending}
                                        aria-label={
                                            showNewPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>
                                        {field.state.meta.errors
                                            .map((err) =>
                                                typeof err === "object" ? err.message : err
                                            )
                                            .join(", ")}
                                    </FieldError>
                                )}
                            </Field>
                        )}
                    />

                    {/* Confirm Password Field */}
                    <changePasswordForm.Field
                        name="confirmPassword"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                                <div className="relative flex items-center">
                                    <Input
                                        id={field.name}
                                        autoComplete="new-password"
                                        placeholder="Confirm your new password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={changePasswordMutation.isPending}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                                        disabled={changePasswordMutation.isPending}
                                        aria-label={
                                            showConfirmPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                                {field.state.meta.errors.length > 0 && (
                                    <FieldError>
                                        {field.state.meta.errors
                                            .map((err) =>
                                                typeof err === "object" ? err.message : err
                                            )
                                            .join(", ")}
                                    </FieldError>
                                )}
                            </Field>
                        )}
                    />

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        form="change-password-form"
                        disabled={changePasswordMutation.isPending}
                        className="w-full mt-2"
                    >
                        {changePasswordMutation.isPending && (
                            <LoaderCircle className="animate-spin" />
                        )}
                        {changePasswordMutation.isPending
                            ? "Updating..."
                            : "Change Password"}
                    </Button>
                </form>

                {/* Password Requirements Info */}
                <div className="mt-6 rounded-lg bg-muted/50 p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                        Password Requirements:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• Contains at least one uppercase letter (A-Z)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordForm;