import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, Clock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { useAuthStore } from "../../store/useAuthStore";
import { accountService } from "../../services/accountService";
import { useToast } from "../../components/ui/use-toast";

export default function DashboardPage() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await accountService.getAccountStatus();
                // API returns { success: true, data: { applicationStatus: ... } }
                setStatus(res.data.data);
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    // New user, no account yet. This is expected.
                    setStatus(null);
                } else {
                    console.error("Failed to fetch status", error);
                    toast({
                        title: "Error",
                        description: "Failed to load account status.",
                        variant: "destructive"
                    });
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
        toast({
            title: "Logged Out",
            description: "You have been logged out successfully.",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Welcome, {user?.name}
                        </span>
                        <Button variant="outline" onClick={handleLogout}>Logout</Button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Account Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Status</CardTitle>
                                <CardDescription>Your current verification status.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-center">
                                        {status?.applicationStatus === "approved" ? (
                                            <>
                                                <CheckCircle className="h-16 w-16 text-green-500" />
                                                <h3 className="text-xl font-bold text-green-600">Verified</h3>
                                                <p className="text-muted-foreground">Your account is active and ready for trading.</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="relative">
                                                    <Clock className="h-16 w-16 text-yellow-500" />
                                                </div>
                                                <h3 className="text-xl font-bold text-yellow-600">
                                                    {status?.applicationStatus ? `Status: ${status.applicationStatus.toUpperCase()}` : "Pending Verification"}
                                                </h3>
                                                <p className="text-muted-foreground mb-4">
                                                    {status?.rejectionReason ? <span className="text-red-500 mb-2 block">Reason: {status.rejectionReason}</span> : null}
                                                    Complete your KYC to activate your account.
                                                </p>
                                                <Button onClick={() => navigate("/kyc")}>
                                                    {status ? "View Application" : "Start Application"}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Activity / Quick Actions - Placeholder */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Manage your investments.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button className="w-full" disabled>Deposit Funds (Coming Soon)</Button>
                                <Button className="w-full" variant="secondary" disabled>View Portfolio (Coming Soon)</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
