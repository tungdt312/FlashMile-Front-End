import {createFileRoute, useRouter} from '@tanstack/react-router'
import {SsgoiTransition} from "@ssgoi/react";
import {Button} from "../../components/ui/button.tsx";
import {LuArrowLeft, LuCircleCheck} from "react-icons/lu";

export const Route = createFileRoute('/_authenticatedRoute/payment-result')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter();
  return <SsgoiTransition id={`/payment-result`}>
    <div className="w-full h-dvh flex flex-col items-center overflow-hidden p-8 bg-background">
      <div className="flex items-center justify-start w-full">
        <Button variant={"outline"} className={"size-10"} onClick={() => router.navigate({to:"/payment"})}>
          <LuArrowLeft/>
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center w-full max-w-xs flex-1 gap-4">
        <img src={'/logo.svg'} alt="" className="w-1/4 max-w-[96px]"/>
        <div className={"w-full flex flex-col gap-2 justify-center items-center"}>
          <LuCircleCheck className={"size-12 text-primary"}/>
          <p className={"heading text-center w-full"}>
            Your payment is success
          </p>
        </div>
        <Button type={"button"} className={"w-full"}
                                       onClick={() => router.navigate({to: "/payment"})}>
          Go to Wallet
        </Button>
      </div>
    </div>
  </SsgoiTransition>
}
