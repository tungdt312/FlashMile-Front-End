import {useRouter} from "@tanstack/react-router";
import {useState} from "react";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft} from "react-icons/lu";
import {FieldSet} from "../../components/ui/field.tsx";
import {Progress} from "../../components/ui/progress.tsx";
import ResetForm from "../../components/forms/reset-form.tsx";
import VerifyCodeForm from "../../components/forms/verify-code-form.tsx";
import {toast} from "sonner";

const ResetPassword = () => {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [token, setToken] = useState("");
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
                    <p className={"heading text-center w-full"}>
                        Reset password
                    </p>
                    <Progress className={"w-full h-2"} value={step * 50}/>
                    <p className={"text-muted-foreground text-center w-full"}>
                        {step == 1 ? "Please enter your email. We will send the 6-digits code to your email in order to know that it’s really you." : undefined}
                        {step == 2 ? "Please enter your new password." : undefined}
                    </p>

                    {step == 1 && <VerifyCodeForm type={"FORGOT_PASSWORD"} onSuccess={(t) => {
                        setStep(step + 1);
                        setToken(t);
                    }}/>}
                    {step == 2 && <ResetForm token={token} onSuccess={() => {
                        toast.success("Reset password successfully")
                        router.navigate({to: "/sign-in"})
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

