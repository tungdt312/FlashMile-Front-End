import {useRouter} from "@tanstack/react-router";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuLoaderCircle} from "react-icons/lu";
import {Field} from "../../components/ui/field.tsx";
import {Input} from "../../components/ui/input.tsx";
import {Separator} from "../../components/ui/separator.tsx";
import {useEffect, useState} from "react";
import {useChallengeMfa, useVerifyMfa} from "../../services/mfa/mfa.ts";
import {useAuthStore} from "../../lib/global.ts";
import {toast} from "sonner";
import type {MfaChallengeCommandMethod} from "../../types";

const MultiFactor = ({method, token}: { method?: string, token?: string }) => {
    const router = useRouter();
    const [otp, setOtp] = useState<string>("")
    const authStore = useAuthStore();
    const challengeService = useChallengeMfa({
        mutation: {
            onSuccess: (data) => {
                console.log(data);
            },
            onError: (err) => {
                toast.error(err.response?.data.message);
                router.history.back()
            }
        }
    })
    const verifyService = useVerifyMfa({
        mutation: {
            onSuccess: (data) => {
                authStore.setAccessToken(data?.data?.accessToken);
                router.navigate({to: '/dashboard'});
            },
            onError: (err) => {
                toast.error(err.response?.data.message || "Verification failed!");
            }
        }
    })
    useEffect(() => {
        challengeService.mutate({
            data: {
                method: method as MfaChallengeCommandMethod,
                verificationToken: token,
            }
        })
    }, [])
    return (
        <div className="w-full h-dvh flex flex-col items-center overflow-hidden p-8 bg-background">
            <div className="flex items-center justify-start w-full">
                <Button variant={"outline"} className={"size-10"} onClick={() => router.history.back()}>
                    <LuArrowLeft/>
                </Button>
            </div>
            <div className="flex flex-col items-center justify-between w-full max-w-xs flex-1">
                <img src={'/logo.svg'} alt="" className="w-1/4 max-w-[96px]"/>
                {(challengeService.isPending)
                    ? <div className={"flex flex-col w-full gap-2"}>
                        <LuLoaderCircle className={"animate-spin"}/>
                        <p>Connecting to third party...</p>
                    </div>
                    : <div className={"flex flex-col w-full gap-2"}>
                        <p className={"heading text-center w-full"}>
                            Multi-factor authentication
                        </p>
                        <p className={"caption text-muted-foreground text-center w-full"}>
                            Enter the code from your multi-factor authentication app or browser extension below.
                        </p>
                        <Field>
                            <Input id={"otp"} autoComplete="off" placeholder="xxxxxx" value={otp}
                                   onChange={(e) => setOtp(e.target.value)}/>
                        </Field>
                        <Button className={"w-full"} onClick={() => {
                            verifyService.mutate({data: {
                                challengeId: challengeService?.data?.data?.challengeId,
                                code: otp,
                                }})
                        }}>
                            {verifyService.isPending && <LuLoaderCircle className={"animate-spin"}/>} Verify
                        </Button>
                        <div className={"flex items-center w-full gap-1"}>
                            <Separator className={"w-full flex-1"}/>
                            <span className={"text-muted-foreground"}>or</span>
                            <Separator className={"w-full flex-1"}/>
                        </div>
                        <Button variant={"outline"} type={"button"} className={"w-full"} onClick={() => {
                            router.navigate({to: "/recovery"})
                        }}>
                            Other method
                        </Button>
                    </div>}
                <Button type={"button"} variant={"outline"} className={"w-full"}
                        onClick={() => router.history.back()}>
                    Cancel
                </Button>
            </div>
        </div>
    )
}
export default MultiFactor
