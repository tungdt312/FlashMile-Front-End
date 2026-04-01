import {z} from "zod";
import {useEffect, useRef, useState} from "react";
// import {useSendVerification, useVerifyCode} from "../../services/authentication/authentication";
import {toast} from "sonner";
import {SendVerificationCodeQueryPurpose} from "../../types";
import {useForm} from "@tanstack/react-form";
import {Field, FieldError, FieldLabel} from "../ui/field.tsx";
import {Input} from "../ui/input.tsx";
import {InputGroup, InputGroupAddon, InputGroupInput} from "../ui/input-group.tsx";
import {Button} from "../ui/button.tsx";
import {LuLoaderCircle} from "react-icons/lu";
import { firebaseAuth} from "../../lib/firebase-config.ts";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";

const VerifyCodeBody = z.object({
    "purpose": z.enum(['PHONE_VERIFICATION', 'EMAIL_VERIFICATION', 'FORGOT_PASSWORD']).optional(),
    "recipient": z.string().min(1, "This field is required."),
    "code": z.string().min(1, "Code is required."),
})
const VerifySchema = VerifyCodeBody.extend({
    purpose: z.literal('PHONE_VERIFICATION')
});
const VerifyCodeForm = ({onSuccess, type}: { onSuccess: (t: string) => void, type: SendVerificationCodeQueryPurpose }) => {
    const [counter, setCounter] = useState<number>(0)
    const convertVnPhone = (phone: string): string => {
        // Kiểm tra nếu chuỗi bắt đầu bằng số 0
        if (phone.startsWith('0') && /^\d+$/.test(phone)) {
            return `+84${phone.slice(1)}`;
        }
        return phone; // Trả về nguyên bản nếu không bắt đầu bằng 0
    };
    // const sendVerificationService = useSendVerification({
    //     mutation: {
    //         onSuccess: () => {
    //             setCounter(60)
    //         },
    //         onError: (err) => {
    //             // err ở đây là LoginMutationError
    //             toast.error(err.response?.data.message || "Send code failed!");
    //         }
    //     }
    // })
    // const sendCode = () => {
    //     if (counter > 0) return;
    //
    //     // Lấy giá trị của field 'recipient' trực tiếp từ form instance
    //     const phoneNumber = verifyForm.getFieldValue("recipient");
    //
    //     if (!phoneNumber) {
    //         toast.error((type == "PHONE_VERIFICATION") ? "Please enter a phone number!" : "Please enter a email!");
    //         return;
    //     }
    //
    //     // Gọi service gửi mã
    //     sendVerificationService.mutate({
    //         data: {
    //             purpose: type,
    //             recipient: convertVnPhone(phoneNumber),
    //         }
    //     });
    // }
    // const verifyService = useVerifyCode({
    //     mutation: {
    //         onSuccess: (value) => {
    //             onSuccess(value.data?.token || "")
    //         },
    //         onError: (err) => {
    //             // err ở đây là LoginMutationError
    //             toast.error(err.response?.data.message || "Verify failed!");
    //         }
    //     }
    // })
    const verifyForm = useForm({
        defaultValues: {
            purpose: type,
            recipient: "",
            code: "",
        },
        validators: {
            onSubmit: VerifySchema
        },
        onSubmit: (value) => {
            // const data = {
            //     purpose: type,
            //     recipient: convertVnPhone(value.value.recipient),
            //     code: value.value.code
            // }
            // verifyService.mutate({data: data})
            onOtpVerify(value.value.code);
        }
    })
    useEffect(() => {
        if (counter <= 0) return;
        const timer = setInterval(() => {
            setCounter(counter - 1);
        }, 1000);

        // Cleanup function: Rất quan trọng để tránh memory leak
        // hoặc chạy nhiều timer cùng lúc khi component re-render
        return () => clearInterval(timer);
    }, [counter]);

    // Phần bổ sung cho firebase
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
    const setupRecaptcha = (id: string) => {
        if (!recaptchaRef.current) {
            recaptchaRef.current = new RecaptchaVerifier(
                firebaseAuth,
                id,
                {
                    'size': 'invisible',
                    'callback': () => {
                        // reCAPTCHA solved
                        console.log("reCAPTCHA solved!");
                    }
                }
            );
        }
        return recaptchaRef.current;
    };

    const sendCode = async () => {
        if (counter > 0) return;

        // Lấy giá trị của field 'recipient' trực tiếp từ form instance
        const phoneNumber = verifyForm.getFieldValue("recipient");

        if (!phoneNumber) {
            toast.error((type == "PHONE_VERIFICATION") ? "Please enter a phone number!" : "Please enter a email!");
            return;
        }

        try {
            setupRecaptcha('recaptcha-container');
            const formatPhone = convertVnPhone(phoneNumber);

            const result = await signInWithPhoneNumber(firebaseAuth, formatPhone);
            setConfirmationResult(result);
            console.log("SMS sent successfully!", result);
        } catch (error) {
          console.error(error);
        }
    };

    const onOtpVerify = async (value: string) => {
        try {
            if (!confirmationResult) {
                toast.error("Please request a verification code first!");
                return;
            }
            setIsVerifying(true);
            const res = await confirmationResult.confirm(value);
            const idToken = await res.user.getIdToken();
            onSuccess(idToken);
        } catch {
            toast.error("Invalid code. Please try again.");
        }
        finally {
            setIsVerifying(false);
        }
    };

    return (<form id={"verify-form"}
                  onSubmit={(e) => {
                      e.preventDefault();
                      verifyForm.handleSubmit();
                  }}
                  className={"flex flex-col w-full gap-3"}>
            <verifyForm.Field
                name="recipient"
                children={(field) => {
                    return (
                        <Field>
                            <FieldLabel htmlFor={field.name}>{(type == "PHONE_VERIFICATION") ? "Phone number" : "Email"}</FieldLabel>
                            <Input id={field.name} type={"text"} autoComplete="off" placeholder=""
                                   onChange={(e) => field.handleChange(e.target.value)}/>
                            {field.state.meta.errors.length > 0 && (
                                <FieldError>
                                    {field.state.meta.errors.map((err) =>
                                        typeof err === 'object' ? err.message : err
                                    ).join(", ")}
                                </FieldError>
                            )}
                        </Field>
                    )
                }
                }/>
            <verifyForm.Field
                name="code"
                children={(field) => {
                    return (
                        <Field>
                            <FieldLabel htmlFor={field.name}>Code</FieldLabel>
                            <InputGroup>
                                <InputGroupInput id={field.name}
                                                 autoComplete="off"
                                                 placeholder="XXXXXX"
                                                 onChange={(e) => field.handleChange(e.target.value)}/>
                                <InputGroupAddon className={(counter > 0) ? "cursor-default" : "cursor-pointer"}
                                                 align={"inline-end"}
                                                 onClick={sendCode}>
                                    {(counter > 0) ? `${counter} s` : "Send code"}
                                </InputGroupAddon>
                            </InputGroup>
                            {field.state.meta.errors.length > 0 && (
                                <FieldError>
                                    {field.state.meta.errors.map((err) =>
                                        typeof err === 'object' ? err.message : err
                                    ).join(", ")}
                                </FieldError>
                            )}
                        </Field>
                    )
                }
                }/>

            <Button className={"w-full"} type={"submit"} form={"verify-form"}
                    // disabled={verifyService.isPending}>
                     disabled={isVerifying}>
                {/* {verifyService.isPending && <LuLoaderCircle className={"animate-spin"}/>} Verify */}
                {isVerifying && <LuLoaderCircle className={"animate-spin"}/>} Verify
            </Button>

            <div id="recaptcha-container"></div>
        </form>
    )
}
export default VerifyCodeForm
