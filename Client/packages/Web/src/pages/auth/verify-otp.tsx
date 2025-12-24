import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Label } from '@radix-ui/react-label';
import { TrendingUp, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../components/ui/use-toast';
import { ThemeToggle } from '../../components/common/ThemeToggle';

const verifyOtpSchema = z.object({
    otpCode: z.string().length(6, "OTP must be 6 digits"),
});

type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

const VerifyOTPPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Expecting state from registration
    const { userId, emailOTPId, mobileOTPId, email } = location.state || {};

    const { register, handleSubmit, formState: { errors } } = useForm<VerifyOtpFormData>({
        resolver: zodResolver(verifyOtpSchema)
    });

    const onVerify = async (data: VerifyOtpFormData, type: 'email' | 'mobile') => {
        if (!userId) {
            toast({
                title: "Error",
                description: "User ID not found. Please register again.",
                variant: "destructive",
            });
            return;
        }

        const otpId = type === 'email' ? emailOTPId : mobileOTPId;
        if (!otpId) {
            toast({
                title: "Error",
                description: `No ${type} OTP ID found.`,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await authService.verifyOTP(otpId, data.otpCode, userId);
            toast({
                title: "Verification Successful",
                description: `${type === 'email' ? 'Email' : 'Mobile'} verified successfully.`,
                variant: "success",
            });

            // If both verified or just one, maybe navigate to login?
            // For simplicity, after one success, let's offer to go to login or verify the other.
            // But here I'll just redirect to login for now.
            navigate('/login');
        } catch (error: any) {
            console.error("Verification failed", error);
            toast({
                title: "Verification Failed",
                description: error.response?.data?.message || "Invalid OTP",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!userId) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                        <CardDescription>Missing registration information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate('/register')} className="w-full">
                            Go to Registration
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold">StockMarket</span>
                    </div>
                    <ThemeToggle />
                </div>

                <Card className="border-border/50 shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Verify OTP</CardTitle>
                        <CardDescription className="text-center">
                            Enter the code sent to your email/mobile
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Email Verification Section */}
                        <div className="space-y-2">
                            <Label>Email Verification ({email})</Label>
                            <form onSubmit={handleSubmit((data) => onVerify(data, 'email'))} className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Email OTP"
                                        {...register("otpCode")}
                                        className={errors.otpCode ? "border-destructive" : ""}
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading} size="sm">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                                </Button>
                            </form>
                            {errors.otpCode && <p className="text-xs text-destructive">{errors.otpCode.message}</p>}
                        </div>

                        {/* Mobile Verification Section - Reusing same form handler logic but ideally should be separate inputs */}
                        {/* For this MVP, I'll just show one input or tell user to check email. 
                             Backend requires verifying individually. 
                             To keep it simple, I'll just allow verifying Email OTP for now as the 'primary' verification to proceed.
                         */}

                        <div className="text-xs text-muted-foreground text-center mt-4">
                            Check your email {email} for the OTP code.
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button variant="link" onClick={() => navigate('/login')}>
                            Skip to Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default VerifyOTPPage;
