import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft} from "react-icons/lu";
import {FieldSet} from "../../components/ui/field.tsx";
import {useRouter} from "@tanstack/react-router";
import {useCallback, useState} from "react";
import {Progress} from "../../components/ui/progress.tsx";
import {toast} from "sonner";
import {BACKEND_URL} from "../../constants/securityConstant.ts";
import SignUpForm from "../../components/forms/sign-up-form.tsx";
import VerifyCodeForm from "../../components/forms/verify-code-form.tsx";


const SignUp = ({provider, step}: { provider?: string, step?: number }) => {
    const router = useRouter();

    const [token, setToken] = useState("")
    const nextStep = () => {
        router.navigate({
            to: "/sign-up",
            search: (prev) => ({ ...prev, step: (Number(step) || 1) + 1 }),
        })
    }
    const signupWithGoogle = useCallback((
        verificationToken: string 
    ) => {
        if (verificationToken.length == 0) {
            toast.error("You need to verify your phone first!");
            return;
        }
        // Điều hướng trực tiếp về endpoint oauth2 của backend, kèm theo token nhận được sau khi verify phone
        const googleOAuthUrl = `${BACKEND_URL}oauth2/authorize/google?verificationToken=${verificationToken}`;
        window.location.href = googleOAuthUrl;
    }, []);

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
                        Create new account
                    </p>
                    <Progress className={"w-full h-2"} value={(step || 1) * 50}/>
                    <p className={"caption text-muted-foreground text-center w-full"}>
                        {step == 1 || !step ? "Please enter your phone number. We will send the 6-digits code to your phone in order to verify for the next step." : undefined}
                        {step == 2 ? "Please enter your info, this will be the info of your account." : undefined}
                    </p>

                    {(step == 1 || !step) && <VerifyCodeForm type={"PHONE_VERIFICATION"} onSuccess={(t) => {
                        setToken(t);
                        if (provider === "google") {
                            signupWithGoogle(t);
                        }
                        else nextStep();
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



