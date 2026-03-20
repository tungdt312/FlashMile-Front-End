import {z} from "zod";
import {useRegisterUser, useSendVerification} from '../../services/authentication/authentication';
import {toast} from "sonner";
import {SendVerificationCodeQueryPurpose} from "../../types";
import {useForm} from "@tanstack/react-form";
import {Field, FieldError, FieldLabel} from "../ui/field.tsx";
import {Input} from "../ui/input.tsx";
import {Button} from "../ui/button.tsx";
import {LuLoaderCircle} from "react-icons/lu";

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
export default SignUpForm