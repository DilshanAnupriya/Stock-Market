import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils";

import { ThemeToggle } from "../../components/common/ThemeToggle";

const steps = [
    { id: 1, name: "Personal Details", path: "/kyc/personal" },
    { id: 2, name: "NIC Upload", path: "/kyc/nic" },
    { id: 3, name: "Bank Details", path: "/kyc/bank" },
    { id: 4, name: "Bank Book", path: "/kyc/bank-book" },
    { id: 5, name: "Billing Proof", path: "/kyc/billing" },
    { id: 6, name: "Employment", path: "/kyc/employment" },
    { id: 7, name: "Nominee", path: "/kyc/nominee" },
    { id: 8, name: "Video KYC", path: "/kyc/video" },
    { id: 9, name: "Declaration", path: "/kyc/declaration" },
];

export default function KYCLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const step = steps.find((s) => location.pathname.includes(s.path));
        if (step) {
            setCurrentStep(step.id);
        } else if (location.pathname === "/kyc" || location.pathname === "/kyc/") {
            navigate(steps[0].path);
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar / Progress */}
            <div className="w-64 bg-card border-r border-border hidden md:block overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold">Verification</h2>
                        <ThemeToggle />
                    </div>
                    <div className="space-y-1">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                                    currentStep === step.id
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs border",
                                        currentStep === step.id
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-input bg-transparent"
                                    )}
                                >
                                    {step.id}
                                </div>
                                {step.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div className="md:hidden flex items-center justify-between w-full">
                            <div>
                                <h2 className="text-lg font-bold">Step {currentStep}: {steps.find(s => s.id === currentStep)?.name}</h2>
                                <div className="w-48 bg-secondary rounded-full h-2.5 mt-2">
                                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(currentStep / steps.length) * 100}%` }}></div>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="hidden md:flex items-center text-sm text-muted-foreground hover:text-foreground"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="m15 18-6-6 6-6" /></svg>
                            Back to Dashboard
                        </button>
                    </div>

                    <Outlet />
                </div>
            </div>
        </div>
    );
}
