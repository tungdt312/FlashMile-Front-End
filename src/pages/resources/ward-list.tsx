import {useRouter} from "@tanstack/react-router";
import {useEffect, useState} from "react";
import {useInView} from "react-intersection-observer";
import {type WardSummaryProjection} from "../../types";
import {useGetAllWards} from "../../services/ward-management/ward-management.ts";
import {Input} from "../../components/ui/input.tsx";
import {Skeleton} from "../../components/ui/skeleton.tsx";

const WardList = ({search, provinceName}: { search?: string, provinceName?: string }) => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState<number>(0);
    const {ref, inView} = useInView()
    const [content, setContent] = useState<WardSummaryProjection[]>([]);
    const [inputValue, setInputValue] = useState(search || "");
    const searching = () => {
        const filters = [];

        if (search) {
            filters.push(`name==^*${search}*`);
        }

        if (provinceName) {
            filters.push(`provinceName==^*${provinceName}*`);
        }

        return filters.length > 0 ? filters.join(' and ') : '';
    }
    const {data, isLoading, isError, isFetching} = useGetAllWards({
        page: currentPage,
        size: 10,
        filter: searching()
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            router.navigate({
                to: "/area",
                search: {search: inputValue || undefined, type: "ward"},
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
                <Input className={"w-full"} placeholder={"Search Ward..."} value={inputValue} onChange={(e) => {
                    // Update URL params via your router to trigger the 'search' prop update
                    setInputValue(e.target.value);
                }}/>

                <div className={"w-full flex-1 flex flex-col items-center justify-start gap-4"}>
                    {content.map((item, i) => <WardCard key={i} ward={item}/>)}
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
                            Cannot get Ward list from server
                        </p>
                    }
                </div>
            </div>
    )
}
export default WardList
const WardCard = ({ward}: { ward: WardSummaryProjection }) => {
    const router = useRouter();
    return (
        <div className="w-full flex p-4 hover:bg-muted rounded-2xl ring-accent ring-1 shadow-md"
             onClick={() => router.navigate({to: `/ward/${ward.id}/`})}>
            <div className="flex items-center justify-between w-full">
                <p className="font-bold caption text-primary"> {ward.type}</p>
                <p className="heading w-full"> {ward.name}</p>
            </div>
        </div>
    )
};

