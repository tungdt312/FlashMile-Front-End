import {useState} from "react";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuEye, LuEyeClosed, LuLoaderCircle} from "react-icons/lu";
import {useRouter} from "@tanstack/react-router";
import {Field, FieldError, FieldLabel} from "../../components/ui/field.tsx";
import {Input} from "../../components/ui/input.tsx";
import {Separator} from "../../components/ui/separator.tsx";
import {FcGoogle} from "react-icons/fc";
import {InputGroup, InputGroupAddon, InputGroupInput} from "../../components/ui/input-group.tsx";
import {useForm} from "@tanstack/react-form";
import {useLogin} from "../../services/authentication/authentication.ts";
import {toast} from "sonner";
import z from "zod";
import {useAuthStore} from "../../lib/global.ts";
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
    const convertVnPhone = (phone: string): string => {
        // Kiểm tra nếu chuỗi bắt đầu bằng số 0
        if (phone.startsWith('0') && /^[0-9]+$/.test(phone)) {
            return `+84${phone.slice(1)}`;
        }
        return phone; // Trả về nguyên bản nếu không bắt đầu bằng 0
    };
    const loginService = useLogin({
        mutation: {
            onSuccess: (res) => {
                // res ở đây chính là LoginMutationResult
                if (!res.data?.accessToken) {
                    toast.error("Login failed.");
                    console.log("Access Token not found!");
                    return;
                }
                // const {data, isError} = useGetMyProfile();
                authStore.setAccessToken(res.data.accessToken);
                // if (isError) {
                //     toast.error("User not found!");
                //     return;
                // }
                // authStore.setUser(data?.data)
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

            loginService.mutate({data: {
                credentialId: convertVnPhone(value.credentialId),
                    password: value.password,
                }});
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
                    <Button className={"w-full"} type={"button"} variant={"ghost"}
                            onClick={() => router.navigate({to: "/reset-password"})}>
                        Forgot password?
                    </Button>
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
