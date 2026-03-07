// import {Button} from "../../components/ui/button.tsx";
// import {LuArrowLeft, LuEye, LuEyeClosed, LuLoaderCircle} from "react-icons/lu";
// import {Field, FieldLabel} from "../../components/ui/field.tsx";
// import {Input} from "../../components/ui/input.tsx";
// import {InputGroup, InputGroupAddon, InputGroupInput} from "../../components/ui/input-group.tsx";
// import {Separator} from "../../components/ui/separator.tsx";
// import {FcGoogle} from "react-icons/fc";
// import {useRouter} from "@tanstack/react-router";
// import {useRegisterUser, useSendVerification, useVerifyCode} from "../../services/authentication/authentication.ts";
// import {z} from "zod";
// import {useForm} from "@tanstack/react-form";
//
// const SendVerificationBody = z.object({
//     "purpose": z.enum(['PHONE_VERIFICATION', 'EMAIL_VERIFICATION', 'FORGOT_PASSWORD']).optional(),
//     "channel": z.enum(['EMAIL', 'PHONE']).optional(),
//     "recipient": z.string().min(1, "Phone number is required."),
// })
//
// const VerifyCodeBody = z.object({
//     "purpose": z.enum(['PHONE_VERIFICATION', 'EMAIL_VERIFICATION', 'FORGOT_PASSWORD']).optional(),
//     "recipient": z.string().optional(),
//     "code": z.string().min(1, "Code is required."),
// })
//
// const RegisterUserBody = z.object({
//     "verificationToken": z.string().min(1, "Phone number was not verified."),
//     "email": z.email().min(1, "Email is required."),
//     "fullName": z.string().min(1, "Full Name is required."),
//     "password": z.string().min(1, "Password is required."),
// })
//
// const SignUp = () => {
//     const router = useRouter();
//     const registerService = useRegisterUser()
//     const sendVerificationService = useSendVerification()
//     const verifyService = useVerifyCode()
//     const registerForm = useForm({
//         defaultValues: {
//
//         },
//         validators: {
//             onSubmit: RegisterUserBody,
//         },
//         onSubmit: (value) => {
//
//         }
//     })
//     return (
//         <div className="w-full h-screen flex flex-col items-center overflow-hidden p-8">
//             <div className="flex items-center justify-start w-full">
//                 <Button variant={"outline"} className={"size-10"} onClick={() => router.history.back()}>
//                     <LuArrowLeft/>
//                 </Button>
//             </div>
//             <div className="flex flex-col items-center justify-between w-full max-w-xs flex-1">
//                 <img src={'/logo.svg'} alt="" className="w-1/4 max-w-[96px]"/>
//                 <form id={"sign-in-form"}
//                       onSubmit={(e) => {
//                           e.preventDefault();
//                           form.handleSubmit();
//                       }}
//                       className={"flex flex-col w-full gap-3"}>
//                     <form.Field
//                         name="credentialId"
//                         children={(field) => {
//                             return (
//                                 <Field>
//                                     <FieldLabel htmlFor={field.name}>Credential Id</FieldLabel>
//                                     <Input id={field.name} autoComplete="off" placeholder="Phone/Email"
//                                            onChange={(e) => field.handleChange(e.target.value)}/>
//                                 </Field>
//                             )
//                         }
//                         }/>
//                     <form.Field
//                         name="password"
//                         children={(field) => {
//                             return (
//                                 <Field>
//                                     <FieldLabel htmlFor={field.name}>Password</FieldLabel>
//                                     <InputGroup>
//                                         <InputGroupInput id={field.name}
//                                                          type={showPassword ? "text" : "password"}
//                                                          autoComplete="off"
//                                                          placeholder="********"
//                                                          onChange={(e) => field.handleChange(e.target.value)}/>
//                                         <InputGroupAddon className={"cursor-pointer"} align={"inline-end"}
//                                                          onClick={() => setShowPassword(!showPassword)}>
//                                             {showPassword ? <LuEye/> : <LuEyeClosed/>}
//                                         </InputGroupAddon>
//                                     </InputGroup>
//                                 </Field>
//                             )
//                         }
//                         }/>
//                     <Button className={"w-full"} type={"submit"} form={"sign-in-form"}
//                             disabled={loginService.isPending}>
//                         {loginService.isPending && <LuLoaderCircle className={"animate-spin"}/>}Sign in
//                     </Button>
//                     <Button className={"w-full"} type={"button"} variant={"ghost"}
//                             onClick={() => router.navigate({to: "/reset-password"})}>
//                         Forgot password?
//                     </Button>
//                     <div className={"flex items-center w-full gap-1"}>
//                         <Separator className={"w-full flex-1"}/>
//                         <span className={"text-sm text-muted-foreground font-medium"}>or</span>
//                         <Separator className={"w-full flex-1"}/>
//                     </div>
//                     <Button variant={"outline"}
//                             className={"w-full"}>
//                         <FcGoogle/>
//                         Continue with Google
//                     </Button>
//                 </form>
//                 <Button type={"button"} variant={"outline"} className={"w-full"}
//                         onClick={() => router.navigate({to: "/sign-up"})}>
//                     Create new account
//                 </Button>
//             </div>
//         </div>
//     )
// }
// export default SignUp
