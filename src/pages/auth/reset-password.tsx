import {useRouter} from "@tanstack/react-router";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuLoaderCircle} from "react-icons/lu";
import {Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet} from "../../components/ui/field.tsx";
import {z} from "zod";
import {useResetPassword} from "../../services/authentication/authentication.ts";
import {toast} from "sonner";
import {useForm} from "@tanstack/react-form";
import {Input} from "../../components/ui/input.tsx";

const ResetPassword = ({code}: { code: string }) => {
    const router = useRouter();

    return (
        <div className="w-full h-dvh flex flex-col items-center p-8 bg-background">
            <div className="flex items-center justify-start w-full">
                <Button variant={"outline"} className={"size-10"} onClick={() => router.history.back()}>
                    <LuArrowLeft/>
                </Button>
            </div>
            <div className="flex flex-col items-center justify-between w-full max-w-xs flex-1 gap-2">
                <img src={'/logo.svg'} alt="" className="w-1/4 max-w-[96px]"/>
                <FieldSet className={"flex flex-col w-full gap-2"}>
                    <FieldLegend className={"text-xl font-bold text-center w-full"}>
                        Reset password
                    </FieldLegend>
                    <FieldDescription className={"text-sm font-medium text-muted-foreground text-center w-full"}>
                        Please enter your new password.
                    </FieldDescription>
                    <ResetForm token={code} onSuccess={() => { router.navigate({to: "/sign-in"})
                    }}/>
                </FieldSet>
                <Button type={"button"} variant={"outline"} className={"w-full"}
                        onClick={() => router.navigate({to: "/sign-in"})}>
                    Go to sign in
                </Button>
            </div>
        </div>
    )
}
export default ResetPassword

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
                toast.success("Reset password successfully.")
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
