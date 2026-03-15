import {useRouter} from "@tanstack/react-router";
import {useState} from "react";


const MultiFactorSet = ({step}: { step?: number }) => {
    const router = useRouter()
    // 1. Lấy step hiện tại từ URL (ví dụ: ?step=1)

    // 2. Local state này SẼ KHÔNG bị mất khi bạn chuyển từ step 1 sang step 2
    const [inputValue, setInputValue] = useState("")

    const nextStep = () => {
        router.navigate({
            to: "/multi-factor-set",
            search: (prev) => ({ ...prev, step: (Number(step) || 1) + 1 }),
        })
    }

    return (
        <div>
            <p>Bước hiện tại: {step}</p>
            <input value={inputValue} onChange={e => setInputValue(e.target.value)}/>
            <button onClick={nextStep}>Sang bước kế tiếp</button>
        </div>
    )
}
export default MultiFactorSet
