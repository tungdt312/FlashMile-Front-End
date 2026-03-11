import {type ReactNode, useEffect, useState} from "react";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuEye, LuEyeClosed, LuLoaderCircle} from "react-icons/lu";
import {useRouter} from "@tanstack/react-router";
import {Field, FieldError, FieldLabel} from "../../components/ui/field.tsx";
import {Input} from "../../components/ui/input.tsx";
import {Separator} from "../../components/ui/separator.tsx";
import {FcGoogle} from "react-icons/fc";
import {InputGroup, InputGroupAddon, InputGroupInput} from "../../components/ui/input-group.tsx";
import {useForm} from "@tanstack/react-form";
import {useLogin, useSendVerification} from "../../services/authentication/authentication.ts";
import {toast} from "sonner";
import z from "zod";
import {useAuthStore} from "../../lib/global.ts";
import {SendVerificationCodeQueryPurpose} from "../../types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../../components/ui/dialog.tsx";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "../../components/ui/drawer.tsx";
import {type ApiResponseVoid, type LoginResult} from "../../types";
import {BACKEND_URL, REFRESH_TOKEN_STORAGE_KEY} from "../../constants/securityConstant.ts";

const LoginBody = z.object({
    "credentialId": z.string().min(1, "Credential ID is required."),
    "password": z.string().min(1, "Password is required."),
})

const SignIn = () => {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const authStore = useAuthStore();
    const loginService = useLogin({
        mutation: {
            onSuccess: (res) => {
                // res ở đây chính là LoginMutationResult
                if (!res.data?.accessToken) {
                    toast.error("Login failed.");
                    console.log("Access Token not found!");
                    return;
                }
                authStore.setAccessToken(res.data.accessToken);
                // Lưu token (ví dụ dùng localStorage hoặc Zustand)
                // Chuyển hướng sang Dashboard
                router.navigate({to: '/dashboard'});
            },
            onError: (err) => {
                // err ở đây là LoginMutationError
                toast.error(err.response?.data.message || "Wrong credential id or password!");
            }
        },
        request: {
            withCredentials: true
        }
    });
    const form = useForm({
        defaultValues: {
            credentialId: '',
            password: '',
        },
        validators: {
            onSubmit: LoginBody,
        },
        onSubmit: async ({value}) => {
            loginService.mutate({data: value});
        },
    });
    const loginWithGoogle = () => {
        const width = 600;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            `${BACKEND_URL}oauth2/authorize/google`,
            "Continue with Google",
            `width=${width},height=${height},top=${top},left=${left}`,
        );

        if (!popup) {
            toast.error("Can not open Google authentication window");
            return;
        }

        let intervalId: number | null = null;

        const messageListener = (event: MessageEvent) => {
            if (event.origin !== BACKEND_URL) return;
            const data: ApiResponseVoid = event.data;
            console.log("Received message:", data);
            if (data.status && data.status < 300) {
                const parseData = data.data as LoginResult;
                const refreshToken = parseData.refreshToken;
                const accessToken = parseData.accessToken;
                if (refreshToken && accessToken) {
                    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
                    authStore.setAccessToken(accessToken);
                    toast.success("Sign in successfully.");
                    router.navigate({ to: "/" });
                    return;
                }
            } else {
                toast.error(
                    "You haven't register with Google yet please try again.",
                );
            }

            popup.close();

            window.removeEventListener("message", messageListener);

            if (intervalId) {
                clearInterval(intervalId);
            }
        };

        intervalId = window.setInterval(() => {
            if (popup.closed) {
                clearInterval(intervalId!);
                window.removeEventListener("message", messageListener);
            }
        }, 500);

        window.addEventListener("message", messageListener);
    };
    return (
        <div className="w-full h-dvh flex flex-col items-center overflow-hidden p-8 bg-background">
            <div className="flex items-center justify-start w-full">
                <Button variant={"outline"} className={"size-10"} onClick={() => router.history.back()}>
                    <LuArrowLeft/>
                </Button>
            </div>
            <div className="flex flex-col items-center justify-between w-full max-w-xs flex-1">
                <img src={'/logo.svg'} alt="" className="w-1/4 max-w-[96px]"/>
                <form id={"sign-in-form"}
                      onSubmit={(e) => {
                          e.preventDefault();
                          form.handleSubmit();
                      }}
                      className={"flex flex-col w-full gap-3"}>
                    <form.Field
                        name="credentialId"
                        children={(field) => {
                            return (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>Credential Id</FieldLabel>
                                    <Input id={field.name} autoComplete="off" placeholder="Phone/Email"
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
                    <form.Field
                        name="password"
                        children={(field) => {
                            return (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput id={field.name}
                                                         type={showPassword ? "text" : "password"}
                                                         autoComplete="off"
                                                         placeholder="********"
                                                         onChange={(e) => field.handleChange(e.target.value)}/>
                                        <InputGroupAddon className={"cursor-pointer"} align={"inline-end"}
                                                         onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <LuEye/> : <LuEyeClosed/>}
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
                    <Button className={"w-full"} type={"submit"} form={"sign-in-form"}
                            disabled={loginService.isPending}>
                        {loginService.isPending && <LuLoaderCircle className={"animate-spin"}/>}Sign in
                    </Button>
                    <VerifyCodeForm>
                        <Button className={"w-full"} type={"button"} variant={"ghost"}>
                            Forgot password?
                        </Button>
                    </VerifyCodeForm>
                    <div className={"flex items-center w-full gap-1"}>
                        <Separator className={"w-full flex-1"}/>
                        <span className={"text-sm text-muted-foreground font-medium"}>or</span>
                        <Separator className={"w-full flex-1"}/>
                    </div>
                    <Button variant={"outline"}
                            type={"button"}
                            className={"w-full"}
                    onClick={loginWithGoogle}>
                        <FcGoogle/>
                        Continue with Google
                    </Button>
                </form>
                <Button type={"button"} variant={"outline"} className={"w-full"}
                        onClick={() => router.navigate({to: "/sign-up"})}>
                    Create new account
                </Button>
            </div>
        </div>
    )
}
export default SignIn


const VerifyCodeForm = ({children}: { children: ReactNode }) => {
    const [open, setOpen] = useState(false)
    const [counter, setCounter] = useState<number>(0)
    const [email, setEmail] = useState<string>("")
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
    useEffect(() => {
        if (counter <= 0) return;
        const timer = setInterval(() => {
            setCounter(counter - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [counter]);
    return (
        <>
            <Dialog>
                <DialogTrigger className={"hidden md:block"} asChild>{children}</DialogTrigger>
                <DialogContent className={"max-w-xs w-full"}>
                    <DialogHeader>
                        <DialogTitle>Reset password</DialogTitle>
                        <DialogDescription>
                            Please enter your email. We will send the 6-digits code to your email in order to know that
                            it’s really you.
                        </DialogDescription>
                    </DialogHeader>
                    <Field className={"w-full"}>
                        <FieldLabel htmlFor={"email"}>Email</FieldLabel>
                        <Input id={"email"} type={"email"} autoComplete="off" placeholder=""
                               onChange={(e) => setEmail(e.target.value)}/>
                    </Field>
                    <Button className={"w-full"} type={"submit"} form={"verify-form"}
                            disabled={sendVerificationService.isPending || counter > 0} onClick={sendCode}>
                        {sendVerificationService.isPending && <LuLoaderCircle className={"animate-spin"}/>}
                        {(counter > 0) ? `${counter} s` : "Send code"}
                    </Button>
                </DialogContent>
            </Dialog>
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger className={"block md:hidden"} asChild>{children}</DrawerTrigger>
                <DrawerContent className="pb-8 px-4 flex flex-col items-center justify-start gap-4 w-full">
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Reset password</DrawerTitle>
                        <DrawerDescription>Please enter your email. We will send the 6-digits code to your email in
                            order to
                            know that it’s really you.</DrawerDescription>
                    </DrawerHeader>
                    <Field className={"w-full"}>
                        <FieldLabel htmlFor={"email"}>Email</FieldLabel>
                        <Input id={"email"} type={"email"} autoComplete="off" placeholder=""
                               onChange={(e) => setEmail(e.target.value)}/>
                    </Field>
                    <Button className={"w-full"} type={"submit"} form={"verify-form"}
                            disabled={sendVerificationService.isPending || counter > 0} onClick={sendCode}>
                        {sendVerificationService.isPending && <LuLoaderCircle className={"animate-spin"}/>}
                        {(counter > 0) ? `${counter} s` : "Send code"}
                    </Button>
                </DrawerContent>
            </Drawer>
        </>
    )
}
