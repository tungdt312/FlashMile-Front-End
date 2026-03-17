import {useRouter} from "@tanstack/react-router";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuLoaderCircle} from "react-icons/lu";
import {Field} from "../../components/ui/field.tsx";
import {Input} from "../../components/ui/input.tsx";
import {useEffect, useState} from "react";
import {useChallengeMfa, useRecoverMfa} from "../../services/mfa/mfa";
import {toast} from "sonner";
import {useAuthStore} from "../../lib/global.ts";
import type {MfaChallengeCommandMethod} from "../../types";

const Recovery = ({method, token}: { method?: string, token?: string }) => {
    const router = useRouter();
    const [otp, setOtp] = useState<string>("")
    const authStore = useAuthStore()
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
    const recoveryService = useRecoverMfa({
        mutation: {
            onSuccess: (data) => {
                authStore.setAccessToken(data?.data?.accessToken);
                router.navigate({to: '/dashboard'});
            },
            onError: (err) => {
                toast.error(err.response?.data.message || "Recoveried failed!");
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
                <div className={"flex flex-col w-full gap-2"}>
                    <p className={"heading text-center w-full"}>
                        Recovery code
                    </p>
                    <p className={"caption text-muted-foreground text-center w-full"}>Enter your recovery code to
                        continue. This is one-use code so that it will be disable after used.</p>
                    <Field>
                        <Input id={"otp"} autoComplete="off" placeholder="xxxxxx" value={otp}
                               onChange={(e) => setOtp(e.target.value)}/>
                    </Field>
                    <Button className={"w-full"} onClick={()=> {
                        recoveryService.mutate({data: {challengeId: challengeService.data?.data?.challengeId, code: otp}})
                    }}>
                        <LuLoaderCircle className={"animate-spin"}/> Use recovery code
                    </Button>
                </div>
                <Button type={"button"} variant={"outline"} className={"w-full"}
                        onClick={() => router.history.back()}>
                    Cancel
                </Button>
            </div>
        </div>
    )
}
export default Recovery
