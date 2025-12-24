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
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../../components/ui/use-toast';
import { ThemeToggle } from '../../components/common/ThemeToggle';

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"), // Note: Backend allows NIC/Mobile too, but frontend used email. Updating logic to be "Identifier" if wanted, but keeping email for now as per UI.
    // Actually, backend controller checks "identifier" against NIC, Email, Mobile.
    // Let's allow generic string for identifier if we want to support all, but the UI field says "Email".
    // I will stick to email validation for now as per current UI Label "Email", or change it to "Email / NIC / Mobile".
    // Given the previous code had specific email validation, I'll stick to it unless I change the UI label.
    // The previous UI had Label "Email". I will keep it simple.
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            // Mapping email to identifier for backend
            const response = await authService.login({
                identifier: data.email,
                password: data.password
            });

            // Login in store
            // Backend response.data contains: { token, user: { ... } } directly?
            // Need to check authMiddleware.js sendTokenResponse.
            // sendTokenResponse sends: { success: true, token, user }
            // So response (from authService.login) will be the whole object.

            // authService.login returns response.data.
            // Let's verify authService.login implementation.
            // It calls api.post and returns response.data.
            // Backend sends: res.status(CODE).json({ success: true, token, user: ... })

            const { token, user } = response as any; // Quick escape for now, or define interface in authService properly.

            login(user, token);

            toast({
                title: "Login Successful",
                description: "Welcome back!",
                variant: "success",
            });
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error("Login failed", error);
            toast({
                title: "Login Failed",
                description: error.response?.data?.message || "Invalid credentials",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    {...register("email")}
                                    className={errors.email ? "border-destructive" : ""}
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    className={errors.password ? "border-destructive" : ""}
                                />
                                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                            </div>
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 text-center text-sm">
                        <div className="text-muted-foreground">
                            Don't have an account?{" "}
                            <button onClick={() => navigate('/register')} className="text-primary hover:underline font-medium">
                                Create account
                            </button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
