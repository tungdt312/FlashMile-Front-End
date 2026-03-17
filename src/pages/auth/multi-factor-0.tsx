import {useRouter} from "@tanstack/react-router";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuMonitor, LuRotateCcw, LuSmartphone} from "react-icons/lu";
import {InitiateMfaSetupMethod} from "../../types";

const MultiFactor0 = ({methods, token}: { methods?: string, token?: string }) => {
    const currentMethods = methods?.split(",") || [];
    const router = useRouter();
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
                        Multi-factor authentication
                    </p>
                    <p className={"caption text-muted-foreground text-center w-full"}>
                        Select an authentication method to continue
                    </p>
                    <div className="w-full flex flex-1 flex-col items-center justify-start gap-4">

                        {currentMethods.includes(InitiateMfaSetupMethod.TOTP) && <Button
                            variant={"outline"}
                            className={"w-full"}
                            onClick={() => router.navigate({
                                to: "/multi-factor",
                                search: {method: InitiateMfaSetupMethod.TOTP, t: token}
                            })}>
                            <LuSmartphone className={"text-primary size-6"}/> Authentication App
                        </Button>}
                        {currentMethods.includes(InitiateMfaSetupMethod.WEBAUTHN) && <Button
                            variant={"outline"}
                            className={"w-full"}
                            onClick={() => router.navigate({
                                to: "/multi-factor",
                                search: {method: InitiateMfaSetupMethod.WEBAUTHN, t: token}
                            })}>
                            <LuMonitor className={"text-primary size-6"}/> WebAuthn
                        </Button>}
                        <Button
                            variant={"outline"}
                            className={"w-full"}
                            onClick={() => router.navigate({
                            to: "/recovery",
                            search: {method: currentMethods[0], t: token}
                        })}>
                            <LuRotateCcw className={"text-primary size-6"}/>Recovery code
                        </Button>
                    </div>

                </div>
                <Button type={"button"} variant={"outline"} className={"w-full"}
                        onClick={() => router.history.back()}>
                    Cancel
                </Button>
            </div>
        </div>
    )
}
export default MultiFactor0
