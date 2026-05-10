import {useEffect} from "react";
import {useRouter} from "@tanstack/react-router";
import {useGetMyProfile} from "../services/user-profile/user-profile";
import {useAuthStore} from "../lib/global";
import {toast} from "sonner";

// UI Components
import {Button} from "../components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "../components/ui/avatar";
import {Skeleton} from "../components/ui/skeleton";

// Icons
import {
    AlertTriangle,
    BarChart3,
    MapPin,
    Navigation,
    Package,
    ShieldCheck,
    Truck,
    UsersRound,
    Warehouse,
} from "lucide-react";

// Animations
import {motion} from "motion/react";

// ============ TEXT COMPONENT ============
interface TextProps extends React.HTMLAttributes<HTMLElement> {
    variant?: "h1" | "h2" | "h3" | "body" | "small" | "caption";
    children: React.ReactNode;
    className?: string;
}

const Text: React.FC<TextProps> = ({
                                       variant = "body",
                                       children,
                                       className = "",
                                       ...props
                                   }) => {
    const variantClasses: Record<string, string> = {
        h1: "display",
        h2: "heading",
        h3: "font-bold text-lg",
        body: "base",
        small: "caption",
        caption: "caption",
    };

    const Element =
        variant === "h1" ? "h1" : variant === "h2" ? "h2" : "p";

    return (
        <Element
            className={`${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </Element>
    );
};

// ============ TYPES ============
interface QuickAccessAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    route: string;
}

interface ActivityItem {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    icon: React.ReactNode;
    iconBg: string;
}

interface FleetStats {
    total: number;
    active: number;
    resting: number;
    activePercentage: number;
}


// ============ MOCK DATA ============
const QUICK_ACCESS_ACTIONS: QuickAccessAction[] = [
    {
        id: "user",
        label: "Users",
        icon: <UsersRound className="size-6 " />,
        route: "/users",
    },
    {
        id: "area",
        label: "Areas",
        icon: <MapPin className="size-6 " />,
        route: "/area",
    },
    {
        id: "depot",
        label: "Depots",
        icon: <Warehouse className="size-6 " />,
        route: "/depot",
    },
    {
        id: "vehicle",
        label: "Vehicles",
        icon: <Truck className="size-6 " />,
        route: "/vehicle",
    },
    {
        id: "roles",
        label: "Permis",
        icon: <ShieldCheck className="size-6 " />,
        route: "/roles",
    },
    {
        id: "reports",
        label: "Reports",
        icon: <BarChart3 className="size-6 " />,
        route: "/reports",
    },
];

const MOCK_RECENT_ACTIVITY: ActivityItem[] = [
    {
        id: "1",
        title: "Order #ORD-2025-001",
        description: "Successfully delivered at District 1, HCMC",
        timestamp: "2 hours ago",
        icon: <Package className="size-5" />,
        iconBg: "bg-blue-100",
    },
    {
        id: "2",
        title: "Temperature Alert",
        description: "Vehicle #VH-001 - Compartment temperature exceeded threshold",
        timestamp: "15 minutes ago",
        icon: <AlertTriangle className="size-5" />,
        iconBg: "bg-red-100",
    },
    {
        id: "3",
        title: "Vehicle #VH-005 Updated",
        description: "Scheduled maintenance completed",
        timestamp: "1 hour ago",
        icon: <Truck className="size-5" />,
        iconBg: "bg-green-100",
    },
];

const MOCK_FLEET_STATS: FleetStats = {
    total: 124,
    active: 89,
    resting: 35,
    activePercentage: 72,
};

// ============ COMPONENTS ============

const GreetingHeader: React.FC<{
    userName: string;
    isLoading: boolean;
}> = ({ userName, isLoading }) => {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="px-4 pt-4 pb-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-b-2xl"
        >
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.navigate({ to: "/me" })}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full flex-shrink-0"
                >
                    <Avatar className="size-[60px] flex-shrink-0 ring-1 ring-primary">
                        <AvatarImage src={""} className="object-cover"/>
                        <AvatarFallback>{userName.charAt(0) || "A"}</AvatarFallback>
                    </Avatar>
                </motion.button>

                {/* Greeting Text */}
                <div className="flex-1 min-w-0">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-4 w-20 mb-2" />
                            <Skeleton className="h-6 w-32" />
                        </>
                    ) : (
                        <>
                            <Text variant="body" className="text-muted-foreground">
                                Good morning,
                            </Text>
                            <Text variant="h2" className="text-foreground truncate">
                                {userName || "User"}
                            </Text>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const QuickAccessSection: React.FC = () => {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
        >
            {/* Horizontal Scrollable Container */}
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory p-6 scrollbar-hide">
                {QUICK_ACCESS_ACTIONS.map((action, ) => (
                    <Button
                        key={action.id}
                        variant={"outline"}
                        onClick={() => router.navigate({ to: action.route })}
                        className={`hover:bg-primary hover:text-primary-foreground flex flex-col items-center justify-center flex-shrink-0 size-20! rounded-2xl transition-all snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                    >
                        {action.icon}
                        <span className="text-xs font-semibold w-full text-center mt-2 px-1 line-clamp-2">
              {action.label}
            </span>
                    </Button>
                ))}
            </div>
        </motion.div>
    );
};

const RecentActivitySection: React.FC<{ activities: ActivityItem[] }> = ({
                                                                             activities,
                                                                         }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="px-4 py-6 border-b border-border"
        >
            <Text variant="h2" className="mb-4">
                Recent Activity
            </Text>

            <div className="space-y-3">
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-border shadow-sm"
                    >
                        {/* Icon Circle */}
                        <div
                            className={`flex-shrink-0 w-12 h-12 rounded-full ${activity.iconBg} flex items-center justify-center`}
                        >
                            {activity.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <Text variant="body" className="text-foreground truncate">
                                {activity.title}
                            </Text>
                            <Text
                                variant="small"
                                className="text-muted-foreground truncate"
                            >
                                {activity.description}
                            </Text>
                        </div>

                        {/* Timestamp */}
                        <div className="flex-shrink-0">
                            <Text variant="caption" className="text-muted-foreground">
                                {activity.timestamp}
                            </Text>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

const FleetStatusSection: React.FC<{ stats: FleetStats }> = ({ stats }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="px-4 py-6 pb-24"
        >
            <Text variant="h2" className="mb-4">
                Fleet Status
            </Text>

            {/* Main Fleet Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 mb-4 text-white shadow-lg"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Text variant="small" className="text-blue-100 mb-1">
                            Total Vehicles
                        </Text>
                        <Text variant="h1" className="text-white">
                            {stats.total}
                        </Text>
                    </div>
                    <Truck className="size-12 text-blue-100 opacity-50" />
                </div>

                <Button
                    variant="secondary"
                    size="sm"
                    className="w-full bg-white text-blue-600 hover:bg-blue-50"
                >
                    <Navigation className="size-4 mr-2" />
                    Live Map
                </Button>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Active Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-blue-50 rounded-2xl p-4 border border-blue-100 shadow-sm"
                >
                    <Text variant="small" className="text-muted-foreground mb-2">
                        Active
                    </Text>
                    <Text variant="h3" className="text-blue-600 mb-1">
                        {stats.active}
                    </Text>
                    <Text variant="caption" className="text-blue-500">
                        {stats.activePercentage}% of total
                    </Text>
                </motion.div>

                {/* Resting Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm"
                >
                    <Text variant="small" className="text-muted-foreground mb-2">
                        Maintenance
                    </Text>
                    <Text variant="h3" className="text-slate-600 mb-1">
                        {stats.resting}
                    </Text>
                    <Text variant="caption" className="text-slate-500">
                        {100 - stats.activePercentage}% of total
                    </Text>
                </motion.div>
            </div>
        </motion.div>
    );
};


// ============ MAIN HOME COMPONENT ============
const HomePage = () => {
    const router = useRouter();
    const authStore = useAuthStore();
    const { data: profileData, isLoading, isError } = useGetMyProfile();

    // Sync profile data to store
    useEffect(() => {
        if (isError) {
            toast.error("Failed to load profile!");
            router.navigate({ to: "/sign-in" });
            return;
        }

        const newUser = profileData?.data;
        if (newUser && newUser.id !== authStore.user?.id) {
            authStore.setUser(newUser);
        }
    }, [profileData, isError, authStore, router]);

    const userName = authStore.user?.fullName || "User";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen bg-white flex flex-col"
        >
            <div className="w-full max-w-lg mx-auto flex-1 overflow-y-auto">
                {/* Greeting Header */}
                <GreetingHeader userName={userName} isLoading={isLoading} />

                {/* Quick Access */}
                <QuickAccessSection />

                {/* Recent Activity */}
                <RecentActivitySection activities={MOCK_RECENT_ACTIVITY} />

                {/* Fleet Status */}
                <FleetStatusSection stats={MOCK_FLEET_STATS} />
            </div>
        </motion.div>
    );
};

export default HomePage;
