import {createFileRoute, Outlet} from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticatedRoute')({
  component: RouteComponent,
})

function RouteComponent() {
    //const router = useRouter();
    // const refreshService =  useRotateToken({
    //     mutation:{
    //         onSuccess: (data) => {
    //             if (data?.data) {
    //                 useAuthStore.setState({accessToken: data.data.accessToken});
    //             }
    //         },
    //         onError: () => {
    //             router.navigate({to: "/"});
    //         }
    //     },
    //     request: {
    //         withCredentials: true
    //     }
    // })
    // useEffect(() => {
    //     if (useAuthStore.getState().accessToken) return
    //     refreshService.mutate({data: {refreshToken: ""}})
    // }, []);
  return <Outlet/>
}
