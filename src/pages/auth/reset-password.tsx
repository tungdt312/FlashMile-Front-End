import {useRouter} from "@tanstack/react-router";
import {useEffect, useState} from "react";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuLoaderCircle} from "react-icons/lu";
import {Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet} from "../../components/ui/field.tsx";
import {Progress} from "../../components/ui/progress.tsx";
import {z} from "zod";
import {
    useRegisterUser,
    useResetPassword,
    useSendVerification,
    useVerifyCode
} from "../../services/authentication/authentication.ts";
import {toast} from "sonner";
import {SendVerificationCodeQueryPurpose} from "../../types";
import {useForm} from "@tanstack/react-form";
import {Input} from "../../components/ui/input.tsx";
import {InputGroup, InputGroupAddon, InputGroupInput} from "../../components/ui/input-group.tsx";

const ResetPassword = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [token, setToken] = useState("")

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
                    <Progress className={"w-full h-2"} value={step * 50}/>
                    <FieldDescription className={"text-sm font-medium text-muted-foreground text-center w-full"}>
                        {step == 1 ? "Please enter your email. We will send the 6-digits code to your email in order to know that it’s really you." : undefined}
                        {step == 2 ? "Please enter your new password." : undefined}
                    </FieldDescription>

                    {step == 1 && <VerifyCodeForm onSuccess={(t) => {
                        setStep(step + 1);
                        setToken(t);
                    }}/>}
                    {step == 2 && <ResetForm token={token} onSuccess={() => {
                    }}/>}
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

const VerifyCodeBody = z.object({
    "purpose": z.enum(['PHONE_VERIFICATION', 'EMAIL_VERIFICATION', 'FORGOT_PASSWORD']).optional(),
    "recipient": z.string().min(1, "Phone is required."),
    "code": z.string().min(1, "Code is required."),
})
const VerifySchema = VerifyCodeBody.extend({
    purpose: z.literal('FORGOT_PASSWORD'),
});
const VerifyCodeForm = ({onSuccess}: { onSuccess: (t: string) => void }) => {
    const [counter, setCounter] = useState<number>(0)
    const sendVerificationService = useSendVerification({
        mutation: {
            onSuccess: () => {
                setCounter(60)
            },
            onError: (err) => {
                // err ở đây là LoginMutationError
                toast.error(err.response?.data.message || "Send code failed!");
            }
        }
    })
    const sendCode = () => {
        if (counter > 0) return;

        // Lấy giá trị của field 'recipient' trực tiếp từ form instance
        const email = verifyPhoneForm.getFieldValue("recipient");

        if (!email) {
            toast.error("Please enter your email!");
            return;
        }

        // Gọi service gửi mã
        sendVerificationService.mutate({
            data: {
                purpose: SendVerificationCodeQueryPurpose.FORGOT_PASSWORD,
                recipient: email,
            }
        });
    }
    const verifyService = useVerifyCode({
        mutation: {
            onSuccess: (value) => {
                onSuccess(value.data?.token || "")
            },
            onError: (err) => {
                // err ở đây là LoginMutationError
                toast.error(err.response?.data.message || "Verify failed!");
            }
        }
    })
    const verifyPhoneForm = useForm({
        defaultValues: {
            purpose: SendVerificationCodeQueryPurpose.FORGOT_PASSWORD,
            recipient: "",
            code: "",
        },
        validators: {
            onSubmit: VerifySchema
        },
        onSubmit: (value) => {
            const data = {
                recipient: value.value.recipient,
                code: value.value.code
            }
            verifyService.mutate({data: data})
        }
    })
    useEffect(() => {
        if (counter <= 0) return;
        const timer = setInterval(() => {
            setCounter(counter - 1);
        }, 1000);

        // Cleanup function: Rất quan trọng để tránh memory leak
        // hoặc chạy nhiều timer cùng lúc khi component re-render
        return () => clearInterval(timer);
    }, [counter]);
    return (<form id={"verify-form"}
                  onSubmit={(e) => {
                      e.preventDefault();
                      verifyPhoneForm.handleSubmit();
                  }}
                  className={"flex flex-col w-full gap-3"}>
            <verifyPhoneForm.Field
                name="recipient"
                children={(field) => {
                    return (
                        <Field>
                            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                            <Input id={field.name} type={"email"} autoComplete="off" placeholder=""
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
            <verifyPhoneForm.Field
                name="code"
                children={(field) => {
                    return (
                        <Field>
                            <FieldLabel htmlFor={field.name}>Code</FieldLabel>
                            <InputGroup>
                                <InputGroupInput id={field.name}
                                                 autoComplete="off"
                                                 placeholder="XXXXXX"
                                                 onChange={(e) => field.handleChange(e.target.value)}/>
                                <InputGroupAddon className={(counter > 0) ? "cursor-default" : "cursor-pointer"}
                                                 align={"inline-end"}
                                                 onClick={sendCode}>
                                    {(counter > 0) ? `${counter} s` : "Send code"}
                                </InputGroupAddon>
                            </InputGroup>
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

            <Button className={"w-full"} type={"submit"} form={"verify-form"}
                    disabled={verifyService.isPending}>
                {verifyService.isPending && <LuLoaderCircle className={"animate-spin"}/>} Verify
            </Button>

        </form>
    )
}
