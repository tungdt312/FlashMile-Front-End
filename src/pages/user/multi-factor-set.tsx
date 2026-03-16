import {useRouter} from "@tanstack/react-router";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuBell, LuCopy, LuDownload} from "react-icons/lu";
import {Progress} from "../../components/ui/progress.tsx";
import {RadioGroup, RadioGroupItem} from "../../components/ui/radio-group.tsx";
import {Field, FieldContent, FieldDescription, FieldLabel, FieldTitle} from "../../components/ui/field.tsx";
import {CompleteSetupMfaCommandMethod} from "../../types";
import {Input} from "../../components/ui/input.tsx";
import {useState} from "react";
import {toast} from "sonner";


const MultiFactorSet = ({step}: { step?: number }) => {
    const router = useRouter()
    // 1. Lấy step hiện tại từ URL (ví dụ: ?step=1)

    // 2. Local state này SẼ KHÔNG bị mất khi bạn chuyển từ step 1 sang step 2
    // const [inputValue, setInputValue] = useState("")
    const [otp, setOtp] = useState<string>("");
    const nextStep = () => {
        if(step! >= 3) {
            router.navigate({to: "/me"})
            toast.success("Set up multi-factor authentication successfully!");
        }
        else {
            router.navigate({
                to: "/multi-factor-set",
                search: (prev) => ({...prev, step: (Number(step) || 1) + 1}),
            })
        }
    }

    return (
        <div className={"w-full h-dvh flex flex-col items-center bg-background"}>
            <div className={"w-full flex items-center justify-between px-4 pt-4"}>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 border-0 rounded-full text-primary!"}
                        onClick={() => {
                            router.history.back()
                        }}>
                    <LuArrowLeft size={20}/>
                </Button>
                <p className={"heading text-center w-full"}>Multi-factor Authentication</p>
                <Button size={"icon-lg"} variant={"outline"}
                        className={"size-10 ring-0 border-0 rounded-full text-foreground"} onClick={() => {
                }}>
                    <LuBell size={20}/>
                </Button>
            </div>
            <div className={"w-full flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-lg"}>
                {(!step || step == 1) && <RadioGroup className="w-full flex flex-1 flex-col items-center justify-start gap-4">
                    <p className={"caption w-full text-muted-foreground"}>This will helps your account secure by
                        verifying
                        that it’s really you.</p>
                    <FieldLabel htmlFor={CompleteSetupMfaCommandMethod.TOTP}>
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle className={"link"}>Authentication app</FieldTitle>
                                <FieldDescription>
                                    Recommended • We'll recommend an app to download if you don't have one. It will
                                    generate a code you'll enter when you log in.
                                </FieldDescription>
                            </FieldContent>
                            <RadioGroupItem value={CompleteSetupMfaCommandMethod.TOTP}
                                            id={CompleteSetupMfaCommandMethod.TOTP}/>
                        </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor={CompleteSetupMfaCommandMethod.WEBAUTHN}>
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle className={"link"}>WebAuthn</FieldTitle>
                                <FieldDescription>
                                    Use your fingerprint, face, or screen lock to verify it's really you.
                                    It's the most secure way to sign in.
                                </FieldDescription>
                            </FieldContent>
                            <RadioGroupItem value={CompleteSetupMfaCommandMethod.WEBAUTHN}
                                            id={CompleteSetupMfaCommandMethod.WEBAUTHN}/>
                        </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor={CompleteSetupMfaCommandMethod.EMAIL}>
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle className={"link"}>Email</FieldTitle>
                                <FieldDescription>We'll send a code to your email in order to
                                    verify.</FieldDescription>
                            </FieldContent>
                            <RadioGroupItem value={CompleteSetupMfaCommandMethod.EMAIL}
                                            id={CompleteSetupMfaCommandMethod.EMAIL}/>
                        </Field>
                    </FieldLabel>
                </RadioGroup>}
                {step == 2 && <div className="w-full flex flex-1 flex-col items-center justify-center gap-4">
                    <p className={"caption w-full text-muted-foreground text-center"}>Scan this QR code with Google
                        Authenticator (or similar) app.</p>
                    <img src={""} alt={"QR"} className={"w-1/2 rounded-2xl p-4 border-1 aspect-square"}/>
                    <p className={"caption w-full text-muted-foreground text-center"}>Cann’t scan? Here is the
                        alternative code.</p>
                    <p className={"py-2 px-4 rounded-xl bg-muted text-muted-foreground flex items-center cursor-pointer hover:bg-muted-foreground hover:text-muted"}
                       onClick={() => {
                       }}>xxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxxx-xxxx <LuCopy className="flex-shrink-0 w-5"/></p>
                    <Field>
                        <FieldLabel htmlFor={"otp"}>Enter your OTP to continue</FieldLabel>
                        <Input id={"otp"} autoComplete="off" placeholder="xxxxxx" value={otp}
                               onChange={(e) => setOtp(e.target.value)}/>
                    </Field>
                </div>}
                {step == 3 && <div className="w-full flex flex-1 flex-col items-center justify-center gap-4">
                    <p className={"heading w-full text-center"}>Recovery codes</p>
                    <p className={"caption w-full text-muted-foreground text-center"}>Keep these recovery codes safe!
                        If you lose access to your authenticator app and don’t have these codes, you’ll lose access to
                        your account.</p>
                    <div
                        className={"w-full flex items-center justify-center gap-4 rounded-2xl p-4 border-1 border-primary"}>
                        <div className={"flex flex-1 flex-col items-center gap-2"}>
                            <p>17d36-5c45d</p>
                            <p>17d36-5c45d</p>
                            <p>17d36-5c45d</p>
                            <p>17d36-5c45d</p>
                            <p>17d36-5c45d</p>
                            <Button variant={"outline"} className={"w-full"}>
                                Copy <LuCopy className="flex-shrink-0 w-5"/>
                            </Button>
                        </div>
                        <div className={"flex flex-1 flex-col items-center gap-2"}>
                            <p>17d36-5c45d</p>
                            <p>17d36-5c45d</p>
                            <p>17d36-5c45d</p>
                            <p>17d36-5c45d</p>
                            <p>17d36-5c45d</p>
                            <Button className={"w-full"}>
                                Download <LuDownload className="flex-shrink-0 w-5"/>
                            </Button>
                        </div>
                    </div>
                </div>}
                <div className={"flex flex-col items-center justify-center gap-2 w-full"}>
                    <Progress className={"w-full h-2"} value={(step || 1) * 100 / 3}/>
                    <div className={"w-full flex items-center justify-between gap-4"}>
                        <p>Step {step || 1} of 3</p>
                        <Button type={"button"} onClick={nextStep}>
                            {((step || 1) < 3) ? "Next" : "Done"}
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    )
}
export default MultiFactorSet
