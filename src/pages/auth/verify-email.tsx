import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuCircleCheck, LuCircleDashed, LuCircleX} from "react-icons/lu";
import {Field, FieldLabel} from "../../components/ui/field.tsx";
import {useRouter} from "@tanstack/react-router";
import {useEffect, useState} from "react";
import {useSendVerification, useVerifyCode} from "../../services/authentication/authentication.ts";
import type {ProcessVerificationQuery, SendVerificationCodeQuery} from "../../types";
import {toast} from "sonner";
import {InputGroup, InputGroupAddon, InputGroupInput} from "../../components/ui/input-group.tsx";


const VerifyEmail = ({code}: { code: string }) => {
    const router = useRouter();
    const [state, setState] = useState<"Pending" | "Success" | "Failed">("Pending")
    const [email, setEmail] = useState<string>("")
    const [counter, setCounter] = useState<number>(0)
    const verifyService = useVerifyCode({
        mutation: {
            onSuccess: () => {
                setState("Success")
            },
            onError: () => {
                setState("Failed")
            },
        }
    })
    const sendVerificationService = useSendVerification({
        mutation: {
            onSuccess: () => {
                setCounter(60)
                toast.success("Code sent successfully! Please check mail for verifying.")
            },
            onError: (err) => {
                // err ở đây là LoginMutationError
                toast.error(err.response?.data.message || "Send code failed!");
            }
        }
    })
    const sendCode = () => {
        const data: SendVerificationCodeQuery = {
            purpose: "EMAIL_VERIFICATION",
            recipient: email,
        }
        sendVerificationService.mutate({data: data})
    }
    useEffect(() => {
        if(!code){
            const data: ProcessVerificationQuery = {
                purpose: "EMAIL_VERIFICATION",
                code: code,
            }
            verifyService.mutate({data: data})
        }
    }, [code])
    useEffect(() => {
        if (counter <= 0) return;
        const timer = setInterval(() => {
            setCounter(counter - 1);
        }, 1000);

        // Cleanup function: Rất quan trọng để tránh memory leak
        // hoặc chạy nhiều timer cùng lúc khi component re-render
        return () => clearInterval(timer);
    }, [counter]);
    return (
        <div className="w-full h-dvh flex flex-col items-center overflow-hidden p-8 bg-background">
            <div className="flex items-center justify-start w-full">
                <Button variant={"outline"} className={"size-10"} onClick={() => router.navigate({to:"/"})}>
                    <LuArrowLeft/>
                </Button>
            </div>
            <div className="flex flex-col items-center justify-center w-full max-w-xs flex-1 gap-4">
                <img src={'/logo.svg'} alt="" className="w-1/4 max-w-[96px]"/>
                <div className={"w-full flex flex-col gap-2 justify-center items-center"}>
                    {state == "Pending" && <LuCircleDashed className={"size-12 animate-spin"}/>}
                    {state == "Success" && <LuCircleCheck className={"size-12 text-primary"}/>}
                    {state == "Failed" && <LuCircleX className={"size-12 text-destructive"}/>}
                    <p className={"heading text-center w-full"}>
                        {state == "Pending" ? "Verifying your email" : undefined}
                        {state == "Success" ? "Your email is verified successfully" : undefined}
                        {state == "Failed" ? "Failed to verify your email" : undefined}
                    </p>
                    <p className={"caption text-muted-foreground text-center w-full"}>
                        {state == "Pending" ? "We have sent an email to your mail. Please check it to complete process." : undefined}
                        {state == "Success" ? "We have verified your email. Now, you can continue to sign in." : undefined}
                        {state == "Failed" ? "We have failed to verify your email. Please try again." : undefined}
                    </p>
                </div>
                {state == "Success" && <Button type={"button"} className={"w-full"}
                                               onClick={() => router.navigate({to: "/sign-in"})}>
                    Go to sign in
                </Button>}
                {state == "Failed" &&
                    <Field>
                        <FieldLabel htmlFor={"email"}>Enter your email to resend code</FieldLabel>
                        <InputGroup>
                            <InputGroupInput id={"email"}
                                             autoComplete="off"
                                             placeholder="abc@gmail.com"
                                             onChange={(e) => setEmail(e.target.value)}/>
                            <InputGroupAddon className={(counter > 0) ? "cursor-default" : "cursor-pointer"}
                                             align={"inline-end"}
                                             onClick={sendCode}>
                                {(counter > 0) ? `${counter} s` : "Send code"}
                            </InputGroupAddon>
                        </InputGroup>
                    </Field>}
            </div>
        </div>
    )
}
export default VerifyEmail
