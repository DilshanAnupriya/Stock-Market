import { useState } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { LayoutDashboard, Users, FileCheck, Wallet, LogOut, Menu, X } from "lucide-react";
import { cn } from "../utils";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "../components/ui/button";

import { ThemeToggle } from "../components/common/ThemeToggle";
import { ProfileDialog } from "../components/dashboard/ProfileDialog";

const sidebarItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "KYC Applications", path: "/admin/kyc", icon: FileCheck },
    { name: "Funds", path: "/admin/funds", icon: Wallet },
];

export default function AdminLayout() {
    const location = useLocation();
    const { logout, user } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Role Check
    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed md:static inset-y-0 left-0 w-64 bg-card border-r border-border z-50 transform transition-transform duration-200 ease-in-out md:transform-none",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold text-primary">Admin Portal</h1>
                        <ThemeToggle />
                        <ProfileDialog />
                    </div>
                    <button
                        className="md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="px-4 space-y-2 mt-4">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary text-white"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-destructive/10"
                        onClick={() => logout()}
                    >
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-card border-b border-border p-4 flex items-center">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-md hover:bg-accent"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-4 font-semibold">Admin Panel</span>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
