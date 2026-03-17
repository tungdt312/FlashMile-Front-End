import {useRouter} from "@tanstack/react-router";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuBell, LuCopy, LuDownload, LuLoaderCircle, LuMonitor, LuSmartphone} from "react-icons/lu";
import {Progress} from "../../components/ui/progress.tsx";
import {RadioGroup, RadioGroupItem} from "../../components/ui/radio-group.tsx";
import {Field, FieldContent, FieldDescription, FieldLabel, FieldTitle} from "../../components/ui/field.tsx";
import {CompleteSetupMfaCommandMethod, type InitiateMfaSetupMethod} from "../../types";
import {Input} from "../../components/ui/input.tsx";
import {useState} from "react";
import {toast} from "sonner";
import {useCompleteMfaSetup, useGetMfaMethods, useInitiateMfaSetup} from "../../services/mfa/mfa";
import {Badge} from "../../components/ui/badge.tsx";
import {startRegistration} from "@simplewebauthn/browser";


const MultiFactorSet = ({step, method}: { step?: number, method?: string }) => {
    const router = useRouter()
    const [option, setOption] = useState<string | undefined>(method);
    const [otp, setOtp] = useState<string>("");
    const [webAuthnJSON, setWebAuthnJSON] = useState({});
    const {data} = useGetMfaMethods()
    const activatedMethods = data?.data?.map(item => item.method as string);
    const initService = useInitiateMfaSetup({
        mutation: {
            onSuccess: (data) => {
                try {
                    const json = JSON.parse(data?.data?.publicKeyCredentialCreationOptions as string)
                    const modifiedJson = {...json, challenge: json.challenge.value};
                    setWebAuthnJSON(startRegistration(modifiedJson));
                    console.log(webAuthnJSON);
                } catch {
                    toast.error("Error getting web authn");
                }
                router.navigate({
                    to: "/multi-factor-set",
                    search: () => ({method: option, step: 2}),
                })
            },
            onError: (error) => {
                toast.error(error.response?.data.message || "Failed to initialize service!");
            }
        }
    })
    const completeService = useCompleteMfaSetup({
        mutation: {
            onSuccess: (data) => {
                if (data?.data?.backupCodes) router.navigate({
                    to: "/multi-factor-set",
                    search: () => ({method: option, step: 3}),
                })
                else {
                    router.navigate({to: "/me"})
                    toast.success("Set up multi-factor authentication successfully!");
                }
            },
            onError: (error) => {
                toast.error(error.response?.data.message || "Failed to complete service!");
            }

        }
    })
    const submit = () => {
        if ((!step || step == 1) && option) {
            initService.mutate({
                params: {
                    method: option as InitiateMfaSetupMethod
                }
            })
        } else if (step && step == 2) {
            completeService.mutate({
                data: {
                    method: option as InitiateMfaSetupMethod,
                    credential: (option == CompleteSetupMfaCommandMethod.WEBAUTHN) ? JSON.stringify(webAuthnJSON) : otp,
                }
            })
        } else if (step && step >= 3) {
            router.navigate({to: "/me"})
            toast.success("Set up multi-factor authentication successfully!");
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
                {(!step || step == 1) && <RadioGroup onValueChange={setOption} value={option}
                                                     className="w-full flex flex-1 flex-col items-center justify-start gap-4">
                    <p className={"caption w-full text-muted-foreground"}>This will helps your account secure by
                        verifying
                        that it’s really you.</p>
                    <FieldLabel htmlFor={CompleteSetupMfaCommandMethod.TOTP}>
                        <Field orientation="horizontal">
                            <LuSmartphone className={"text-primary size-6"}/>
                            <FieldContent>
                                <FieldTitle className={"link flex items-center justify-between"}>
                                    <p> Authentication app</p>
                                    {activatedMethods?.includes(CompleteSetupMfaCommandMethod.TOTP) &&
                                        <Badge>Configured</Badge>}
                                </FieldTitle>
                                <FieldDescription>
                                    Recommended • We'll recommend an app to download if you don't have one. It will
                                    generate a code you'll enter when you log in.
                                </FieldDescription>
                            </FieldContent>
                            <RadioGroupItem value={CompleteSetupMfaCommandMethod.TOTP}
                                            id={CompleteSetupMfaCommandMethod.TOTP}
                                            disabled={activatedMethods?.includes(CompleteSetupMfaCommandMethod.TOTP)}/>
                        </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor={CompleteSetupMfaCommandMethod.WEBAUTHN}>
                        <Field orientation="horizontal">
                            <LuMonitor className={"text-primary size-6"}/>
                            <FieldContent>
                                <FieldTitle className={"link flex items-center justify-between"}>
                                    <p> WebAuthn</p>
                                    {activatedMethods?.includes(CompleteSetupMfaCommandMethod.WEBAUTHN) &&
                                        <Badge>Configured</Badge>}
                                </FieldTitle>
                                <FieldDescription>
                                    Use your fingerprint, face, or screen lock to verify it's really you.
                                    It's the most secure way to sign in.
                                </FieldDescription>
                            </FieldContent>
                            <RadioGroupItem value={CompleteSetupMfaCommandMethod.WEBAUTHN}
                                            id={CompleteSetupMfaCommandMethod.WEBAUTHN}
                                            disabled={activatedMethods?.includes(CompleteSetupMfaCommandMethod.WEBAUTHN)}/>
                        </Field>
                    </FieldLabel>
                </RadioGroup>}
                {step == 2 && <div className="w-full flex flex-1 flex-col items-center justify-center gap-4">
                    {method == CompleteSetupMfaCommandMethod.TOTP &&
                        <div className="w-full flex flex-1 flex-col items-center justify-center gap-4">
                            <p className={"caption w-full text-muted-foreground text-center"}>Scan this QR code with
                                Google
                                Authenticator (or similar) app.</p>
                            <img src={initService.data?.data?.qrCodeUrl || ""} alt={"QR"}
                                 className={"w-1/2 rounded-xl p-2 border-1 aspect-square"}/>
                            <p className={"caption w-full text-muted-foreground text-center"}>Cann’t scan? Here is the
                                alternative code.</p>
                            <p className={"py-2 px-4 rounded-xl bg-muted text-muted-foreground flex items-center cursor-pointer hover:bg-muted-foreground hover:text-muted"}
                               onClick={() => {
                               }}>{initService.data?.data?.secret || ""}<LuCopy className="flex-shrink-0 w-5"/></p>
                            <Field>
                                <FieldLabel htmlFor={"otp"}>Enter your OTP to continue</FieldLabel>
                                <Input id={"otp"} autoComplete="off" placeholder="xxxxxx" value={otp}
                                       onChange={(e) => setOtp(e.target.value)}/>
                            </Field>
                        </div>
                    }

                    {method == CompleteSetupMfaCommandMethod.WEBAUTHN &&
                        <div className={"flex flex-col w-full items-center justify-center gap-2"}>
                            <LuLoaderCircle className={"animate-spin size-6"}/>
                            <p>Connecting to third party...</p>
                        </div>}
                </div>}
                {step == 3 && <div className="w-full flex flex-1 flex-col items-center justify-center gap-4">
                    <p className={"heading w-full text-center"}>Recovery codes</p>
                    <p className={"caption w-full text-muted-foreground text-center"}>Keep these recovery codes safe!
                        If you lose access to your authenticator app and don’t have these codes, you’ll lose access to
                        your account.</p>
                    <div
                        className={"w-full flex items-center justify-center gap-4 rounded-2xl p-4 border-1 border-primary"}>
                        <div className="w-full space-y-6">
                            {/* The Grid Container */}
                            <div className="grid grid-cols-2 gap-3">
                                {completeService.data?.data?.backupCodes?.map((code, index) => (
                                    <p
                                        key={index}
                                        className="font-mono text-sm py-2 px-3 border rounded-md bg-muted/50 text-center"
                                    >
                                        {code}
                                    </p>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        const allCodes = completeService.data?.data?.backupCodes?.join('\n');
                                        if (allCodes) navigator.clipboard.writeText(allCodes);
                                    }}
                                >
                                    <LuCopy className="mr-2 h-4 w-4"/> Copy All
                                </Button>

                                <Button
                                    className="flex-1"
                                    onClick={() => {
                                        const content = completeService.data?.data?.backupCodes?.join('\n');
                                        const blob = new Blob([content || ""], {type: 'text/plain'});
                                        const url = URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = 'backup-codes.txt';
                                        link.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                >
                                    <LuDownload className="mr-2 h-4 w-4"/> Download
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>}
                <div className={"flex flex-col items-center justify-center gap-2 w-full"}>
                    <Progress className={"w-full h-2"} value={(step || 1) * 100 / 3}/>
                    <div className={"w-full flex items-center justify-between gap-4"}>
                        <p>Step {step || 1} of 3</p>
                        <Button type={"button"} onClick={submit}>
                            {((step || 1) < 3) ? "Next" : "Done"}
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    )
}
export default MultiFactorSet
