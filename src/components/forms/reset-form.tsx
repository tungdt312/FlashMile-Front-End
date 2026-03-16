import {z} from "zod";
import {useResetPassword} from "../../services/authentication/authentication.ts";
import {toast} from "sonner";
import {useForm} from "@tanstack/react-form";
import {Field, FieldError, FieldLabel} from "../ui/field.tsx";
import {Input} from "../ui/input.tsx";
import {Button} from "../ui/button.tsx";
import {LuLoaderCircle} from "react-icons/lu";

const ResetPasswordBody = z.object({
    "verificationToken": z.string().min(1, "Phone number was not verified."),
    "newPassword": z.string().min(1, "Password is required."),
    "confirmPassword": z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Confirm password is not matched",
    path: ["confirmPassword"],
})
const ResetForm = ({token, onSuccess}: { token: string, onSuccess: () => void }) => {
    const resetService = useResetPassword({
        mutation: {
            onSuccess: () => {
                onSuccess()
            },
            onError: (err) => {
                // err ở đây là LoginMutationError
                toast.error(err.response?.data.message || "Reset password failed!");
            }
        }
    })
    const resetForm = useForm({
        defaultValues: {
            verificationToken: token,
            newPassword: "",
            confirmPassword: "",
        },
        validators: {
            onSubmit: ResetPasswordBody,
        },
        onSubmit: (value) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {confirmPassword, ...data} = value.value
            resetService.mutate({data: data})
        }
    })
    return (
        <form id={"reset-password-form"}
              onSubmit={(e) => {
                  e.preventDefault();
                  resetForm.handleSubmit();
              }}
              className={"flex flex-col w-full gap-3"}>

            <resetForm.Field
                name="newPassword"
                children={(field) => {
                    return (
                        <Field>
                            <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                            <Input id={field.name} autoComplete="off" placeholder="*******"
                                   type={"password"}
                                   onChange={(e) => field.handleChange(e.target.value)}/>
                            {field.state.meta.errors.length > 0 && (
                                <FieldError>
                                    {field.state.meta.errors.map((err) =>
                                        typeof err === 'object' ? err.message : err
                                    ).join(", ")}
                                </FieldError>
                            )}
                        </Field>
                    )
                }
                }/>
            <resetForm.Field
                name="confirmPassword"
                children={(field) => {
                    return (
                        <Field>
                            <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                            <Input id={field.name} autoComplete="off" placeholder="*******"
                                   type={"password"}
                                   onChange={(e) => field.handleChange(e.target.value)}/>
                            {field.state.meta.errors.length > 0 && (
                                <FieldError>
                                    {field.state.meta.errors.map((err) =>
                                        typeof err === 'object' ? err.message : err
                                    ).join(", ")}
                                </FieldError>
                            )}
                        </Field>
                    )
                }
                }/>
            <Button className={"w-full"} type={"submit"} form={"reset-password-form"}
                    disabled={resetService.isPending}>
                {resetService.isPending && <LuLoaderCircle className={"animate-spin"}/>} Reset password
            </Button>

        </form>
    )
}
export default ResetForm