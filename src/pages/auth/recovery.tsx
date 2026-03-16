import {useRouter} from "@tanstack/react-router";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuLoaderCircle} from "react-icons/lu";
import {Field} from "../../components/ui/field.tsx";
import {Input} from "../../components/ui/input.tsx";
import {useState} from "react";

const Recovery = () => {
    const router = useRouter();
    const [otp, setOtp] = useState<string>("")

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
                    <Button className={"w-full"} type={"submit"} form={"sign-in-form"}>
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
