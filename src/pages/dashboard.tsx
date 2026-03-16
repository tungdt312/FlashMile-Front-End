import {Link, useRouter} from "@tanstack/react-router";
import {useGetMyProfile} from "../services/user-profile/user-profile.ts";
import {useEffect} from "react";
import {toast} from "sonner";
import {useAuthStore} from "../lib/global.ts";


const Dashboard = () => {
    const router = useRouter();
    const {data, isError} = useGetMyProfile();
    const authStore = useAuthStore();
    useEffect(() => {
        if (isError) {
            toast.error("User not found!");
            router.navigate({ to: "/sign-in" });
            return;
        }
        // 2. Xử lý khi đã có dữ liệu profile thành công
        const newUser = data?.data;
        if (newUser && newUser.id !== authStore.user?.id) {
            authStore.setUser(newUser);
        }

    }, [data, isError, authStore, router]);
    return (
        <div>
            <Link to={"/me"}>Me</Link>
            <Link to={"/roles"}>Roles</Link>
        </div>
    )
}
export default Dashboard
