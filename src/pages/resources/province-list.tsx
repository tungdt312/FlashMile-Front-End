import {useRouter} from "@tanstack/react-router";
import {useEffect, useState} from "react";
import {useInView} from "react-intersection-observer";
import {ProvinceResultType, type ProvinceSummaryProjection} from "../../types";
import {useGetAllProvinces} from "../../services/province-management/province-management.ts";
import {Input} from "../../components/ui/input.tsx";
import {Skeleton} from "../../components/ui/skeleton.tsx";
import {Building2, LandPlot} from "lucide-react";

const ProvinceList = ({search}: { search?: string }) => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState<number>(0);
    const {ref, inView} = useInView()
    const [content, setContent] = useState<ProvinceSummaryProjection[]>([]);
    const [inputValue, setInputValue] = useState(search || "");
    const {data, isLoading, isError, isFetching} = useGetAllProvinces({
        page: currentPage,
        size: 10,
        filter: search ? `name==^*${search}*` : undefined
    });
    useEffect(() => {
        const handler = setTimeout(() => {
            router.navigate({
                to: "/area",
                search: {search: inputValue || undefined, type: "province"},
                replace: true // Replaces history entry so "Back" button isn't clogged with search steps
            });
        }, 500);

        return () => clearTimeout(handler);
    }, [inputValue, router]);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setContent([]);
        setCurrentPage(0);
    }, [search]);

    useEffect(() => {
        const newContent = data?.data?.content;
        if (newContent && newContent.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setContent((prev) => {
                if (currentPage === 0) return newContent;
                if (prev.some(item => item.id === newContent[0].id)) return prev;
                return [...prev, ...newContent];
            });
        }
    }, [data, currentPage]);
    useEffect(() => {
        const isLastPage = data?.data?.last; // Check if backend says this is the last page
        if (inView && !isFetching && !isLastPage) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentPage((prev) => prev + 1);
        }
    }, [inView, isFetching, data]);
    return (

            <div className={"w-full flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-lg"}>
                <Input className={"w-full"} placeholder={"Search Province..."} value={inputValue} onChange={(e) => {
                    // Update URL params via your router to trigger the 'search' prop update
                    setInputValue(e.target.value);
                }}/>

                <div className={"w-full flex-1 flex flex-col items-center justify-start gap-4"}>
                    {content.map((item, i) => <ProvinceCard key={i} province={item}/>)}
                    {(isLoading || isFetching) &&
                        <div
                            className="w-full flex flex-col items-center justify-between p-4 hover:bg-muted rounded-2xl ring-accent ring-1 shadow-md overflow-hidden">
                            <div className={"link flex items-center justify-between"}>
                                <Skeleton className="h-5 w-1/3"/>
                                <Skeleton className="h-5 w-[75px]"/>
                            </div>
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-1/2"/>
                        </div>
                    }
                    <div ref={ref} className="h-10 w-full"/>
                    {isError &&
                        <p className={"w-full text-muted-foreground caption text-center"}>
                            Cannot get Province list from server
                        </p>
                    }
                </div>
            </div>
    )
}
export default ProvinceList
const ProvinceCard = ({province}: { province: ProvinceSummaryProjection }) => {
    const router = useRouter();
    return (
        <div className="w-full flex p-4 hover:bg-muted rounded-2xl ring-accent ring-1 shadow-md"
             onClick={() => router.navigate({to: `/province/${province.id}/`})}>
            <div className={"p-1 rounded-xl size-8 bg-primary-200 text-primary border-primary border-1"}>
                {province.type === ProvinceResultType.CITY ? <Building2 className={"size-full"}/> : <LandPlot className={"size-full"}/> }
            </div>
            <div className="flex items-center justify-between w-full">
                <p className="font-bold caption text-primary"> {province.type}</p>
                <p className="heading w-full"> {province.name}</p>
            </div>
        </div>
    )
};
