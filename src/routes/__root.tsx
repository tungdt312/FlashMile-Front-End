import {createRootRoute, Outlet, useRouterState} from '@tanstack/react-router'
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools'
import {Ssgoi, type SsgoiConfig} from "@ssgoi/react";
import {drill} from "@ssgoi/core/view-transitions";
import {useCallback, useMemo} from "react";
import {fade} from "@ssgoi/core/transitions";

const RootLayout = () => {
    const config = useMemo<SsgoiConfig>(
        () => ({
            // 1. Chỉ cần khai báo 2 bộ quy tắc đại diện này thôi
            transitions: [
                {
                    from: "root",
                    to: "sub",
                    transition: drill({ direction: "enter" }),
                },
                {
                    from: "sub",
                    to: "root",
                    transition: drill({ direction: "exit" }),
                },
            ],
            defaultTransition: fade(),
            middleware: (from: string, to: string) => {
                const normalize = (p: string) => {
                    if (!p || p === "/" || p === "") return "/";
                    return p.replace(/\/$/, ""); // Xóa dấu / ở cuối nếu có
                };

                const nFrom = normalize(from);
                const nTo = normalize(to);

                const getLevel = (path: string) => {
                    if (path === "/") return 0;
                    return path.split("/").filter(Boolean).length;
                };

                const fromLevel = getLevel(nFrom);
                const toLevel = getLevel(nTo);
                if (fromLevel > toLevel) {
                    return { from: "sub", to: "root" };
                } else if (fromLevel < toLevel) {
                    return { from: "root", to: "sub" };
                }

                return { from: "root", to: "root" };
            },
        }),
        [],
    );
    const routerState = useRouterState()
    const getPathname = useCallback(() => {
        return routerState.location.pathname;
    }, [routerState.location.pathname]);
    return (
        <>
            <Ssgoi config={config} usePathname={getPathname}>
                <div style={{ position: "relative", minHeight: "100vh" }} className={"overscroll-none"}>
                    <Outlet />
                </div>
            </Ssgoi>
            <TanStackRouterDevtools />
        </>
    );
};

export const Route = createRootRoute({component: RootLayout})