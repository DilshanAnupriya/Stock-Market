import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '@radix-ui/react-label';
import { TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { authService } from '../../services/authService';
import { useToast } from '../../components/ui/use-toast';
import { ThemeToggle } from '../../components/common/ThemeToggle';

const registerSchema = z.object({
    nic: z.string().regex(/^[0-9]{9}[vVxX]$|^[0-9]{12}$/, "NIC must be in format 123456789V or 123456789012"),
    email: z.string().email("Please enter a valid email address"),
    mobile: z.string().regex(/^0[0-9]{9}$/, "Mobile number must be 10 digits starting with 0"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, "Password must contain at least one uppercase, one lowercase, one number and one special character"),
    accountType: z.enum(["individual", "joint", "corporate"]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            accountType: "individual"
        }
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            const response = await authService.register(data);
            toast({
                title: "Registration Successful",
                description: response.message,
                variant: "success",
            });
            // Store registration data for OTP if needed, or just navigate
            // For now, navigating to verify-otp (assuming it exists or will be created)
            // Passing userId and email/mobile via state could be useful for the OTP page
            navigate('/verify-otp', { state: { ...response.data } });
        } catch (error: any) {
            console.error("Registration failed", error);
            toast({
                title: "Registration Failed",
                description: error.response?.data?.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
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
                        <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                        <CardDescription className="text-center">
                            Start your investment journey today
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nic">National Identity Card (NIC)</Label>
                                <Input
                                    id="nic"
                                    placeholder="200012345678"
                                    {...register("nic")}
                                    className={errors.nic ? "border-destructive" : ""}
                                />
                                {errors.nic && <p className="text-xs text-destructive">{errors.nic.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register("email")}
                                    className={errors.email ? "border-destructive" : ""}
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input
                                    id="mobile"
                                    placeholder="0771234567"
                                    {...register("mobile")}
                                    className={errors.mobile ? "border-destructive" : ""}
                                />
                                {errors.mobile && <p className="text-xs text-destructive">{errors.mobile.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    className={errors.password ? "border-destructive" : ""}
                                />
                                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accountType">Account Type</Label>
                                <select
                                    id="accountType"
                                    {...register("accountType")}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="individual">Individual</option>
                                    <option value="joint">Joint</option>
                                    <option value="corporate">Corporate</option>
                                </select>
                            </div>

                            <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                                    </>
                                ) : (
                                    <>
                                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 text-center text-sm">
                        <div className="text-muted-foreground">
                            Already have an account?{" "}
                            <button onClick={() => navigate('/login')} className="text-primary hover:underline font-medium">
                                Sign in
                            </button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
