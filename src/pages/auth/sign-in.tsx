import * as React from "react";
import {useLogin} from "../../services/authentication/authentication.ts";

const SignIn = () => {
    const [credentialId, setCredentialId] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const loginService = useLogin();
    const login = async () => {
        loginService.mutate({
            data: {
                credentialId,
                password,
            }
        })
    }
    return (
        <div>
            <input value={credentialId} onChange={(e) => setCredentialId(e.target.value)}/>
            <input value={password} onChange={(e) => setPassword(e.target.value)}/>
            <button onClick={login}>Login</button>
        </div>
    )
}
export default SignIn
