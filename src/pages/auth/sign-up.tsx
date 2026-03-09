import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuLoaderCircle} from "react-icons/lu";
import {Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet} from "../../components/ui/field.tsx";
import {Input} from "../../components/ui/input.tsx";
import {useRouter} from "@tanstack/react-router";
import {useRegisterUser, useSendVerification, useVerifyCode} from "../../services/authentication/authentication.ts";
import {z} from "zod";
import {useForm} from "@tanstack/react-form";
import {useEffect, useState} from "react";
import {Progress} from "../../components/ui/progress.tsx";
import {SendVerificationCodeQueryPurpose} from "../../types";
import {toast} from "sonner";
import {InputGroup, InputGroupAddon, InputGroupInput} from "../../components/ui/input-group.tsx";


const SignUp = () => {
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
                        Create new account
                    </FieldLegend>
                    <Progress className={"w-full h-2"} value={step * 50}/>
                    <FieldDescription className={"text-sm font-medium text-muted-foreground text-center w-full"}>
                        {step == 1 ? "Please enter your phone number. We will send the 6-digits code to your phone in order to verify for the next step." : undefined}
                        {step == 2 ? "Please enter your info, this will be the info of your account." : undefined}
                    </FieldDescription>

                    {step == 1 && <VerifyCodeForm onSuccess={(t) => {
                        setStep(step + 1);
                        setToken(t);
                    }}/>}
                    {step == 2 && <SignUpForm token={token} onSuccess={() => {
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
export default SignUp

const RegisterUserBody = z.object({
    "verificationToken": z.string().min(1, "Phone number was not verified."),
    "email": z.email().min(1, "Email is required."),
    "fullName": z.string().min(1, "Full Name is required."),
    "password": z.string().min(1, "Password is required."),
    "confirmPassword": z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password is not matched",
    path: ["confirmPassword"],
})
const SignUpForm = ({token, onSuccess}: { token: string, onSuccess: () => void }) => {
    const sendVerificationService = useSendVerification({
        mutation: {
            onSuccess: () => {
                toast.success("Create account successfully! Please check mail for verifying.")
            },
            onError: (err) => {
                // err ở đây là LoginMutationError
                toast.error(err.response?.data.message || "Send code failed!");
            }
        }
    })
    const sendCode = () => {
        // Lấy giá trị của field 'recipient' trực tiếp từ form instance
        const email = registerForm.getFieldValue("email");
        // Gọi service gửi mã
        sendVerificationService.mutate({
            data: {
                purpose: SendVerificationCodeQueryPurpose.EMAIL_VERIFICATION,
                recipient: email,
            }
        });
    }
    const registerService = useRegisterUser({
        mutation: {
            onSuccess: () => {
                sendCode()
                onSuccess()
            },
            onError: (err) => {
                // err ở đây là LoginMutationError
                toast.error(err.response?.data.message || "Create account failed!");
            }
        }
    })
    const registerForm = useForm({
        defaultValues: {
            verificationToken: token,
            email: "",
            fullName: "",
            password: "",
            confirmPassword: "",
        },
        validators: {
            onSubmit: RegisterUserBody,
        },
        onSubmit: (value) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {confirmPassword, ...data} = value.value
            registerService.mutate({data: data})
        }
    })
    return (
        <form id={"sign-up-form"}
              onSubmit={(e) => {
                  e.preventDefault();
                  registerForm.handleSubmit();
              }}
              className={"flex flex-col w-full gap-3"}>
            <registerForm.Field
                name="fullName"
                children={(field) => {
                    return (
                        <Field>
                            <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                            <Input id={field.name} autoComplete="off" placeholder="John Smith"
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
            <registerForm.Field
                name="email"
                children={(field) => {
                    return (
                        <Field>
                            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                            <Input id={field.name} autoComplete="off" placeholder="john123@gmail.com"
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
            <registerForm.Field
                name="password"
                children={(field) => {
                    return (
                        <Field>
                            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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
            <registerForm.Field
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
            <Button className={"w-full"} type={"submit"} form={"sign-up-form"}
                    disabled={registerService.isPending}>
                {registerService.isPending && <LuLoaderCircle className={"animate-spin"}/>} Create new
                account
            </Button>

        </form>
    )
}

const VerifyCodeBody = z.object({
    "purpose": z.enum(['PHONE_VERIFICATION', 'EMAIL_VERIFICATION', 'FORGOT_PASSWORD']).optional(),
    "recipient": z.string().min(1, "Phone is required."),
    "code": z.string().min(1, "Code is required."),
})
const VerifyPhoneSchema = VerifyCodeBody.extend({
    purpose: z.literal('PHONE_VERIFICATION')
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
        const phoneNumber = verifyPhoneForm.getFieldValue("recipient");

        if (!phoneNumber) {
            toast.error("Please enter a phone number!");
            return;
        }

        // Gọi service gửi mã
        sendVerificationService.mutate({
            data: {
                purpose: SendVerificationCodeQueryPurpose.PHONE_VERIFICATION,
                recipient: phoneNumber,
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
            purpose: SendVerificationCodeQueryPurpose.PHONE_VERIFICATION,
            recipient: "",
            code: "",
        },
        validators: {
            onSubmit: VerifyPhoneSchema
        },
        onSubmit: (value) => {
            const data = {
                ...value.value,
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
                            <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
                            <Input id={field.name} autoComplete="off" placeholder="+84xxxxxxxxx"
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
