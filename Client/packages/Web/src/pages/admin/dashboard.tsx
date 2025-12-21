import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import { Users, FileCheck, AlertCircle, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminService.getStats();
                setStats(res.data.data);
            } catch (err) {
                console.error("Failed to load stats", err);
                setError("Failed to load dashboard statistics");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (error) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-red-500">
                <AlertCircle className="mr-2 h-6 w-6" />
                {error}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <h1 className="text-2xl font-bold">Loading Dashboard...</h1>
                </div>
                <DashboardSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>

            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats?.users?.total || 0}
                    icon={Users}
                    description={`${stats?.users?.active} Active Users`}
                />
                <StatCard
                    title="Pending KYC"
                    value={stats?.kyc?.pending || 0}
                    icon={FileCheck}
                    description="Requires Review"
                    alert={stats?.kyc?.pending > 0}
                />
                <StatCard
                    title="Total Deposits"
                    value={`LKR ${(stats?.deposits?.total || 0).toLocaleString()}`}
                    icon={ArrowUpRight}
                    description={`${stats?.deposits?.count} Transactions`}
                />
                <StatCard
                    title="Total Withdrawals"
                    value={`LKR ${(stats?.withdrawals?.total || 0).toLocaleString()}`}
                    icon={ArrowDownRight}
                    description={`${stats?.withdrawals?.count} Transactions`}
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Pending Transactions</span>
                                <span className="font-bold">{stats?.transactions?.pending || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Failed Transactions</span>
                                <span className="font-bold text-red-500">{stats?.transactions?.failed || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Completed Transactions</span>
                                <span className="font-bold text-green-500">{stats?.transactions?.completed || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, description, alert }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 text-muted-foreground ${alert ? "text-red-500 animate-pulse" : ""}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
