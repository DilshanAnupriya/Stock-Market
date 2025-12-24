import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Shield, TrendingUp, Smartphone, Globe } from 'lucide-react';
import { ThemeToggle } from '../../components/common/ThemeToggle';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b border-border/40 backdrop-blur-xl fixed w-full z-50 bg-background/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-primary" />
                            <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                                StockMarket
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Button variant="ghost" onClick={() => navigate('/login')}>
                                Log In
                            </Button>
                            <Button onClick={() => navigate('/register')}>
                                Start Investing
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground mb-6">
                            Invest in your future with <span className="text-primary">confidence</span>
                        </h1>
                        <p className="mt-4 text-xl text-muted-foreground mb-8">
                            Access the Sri Lankan stock market with our state-of-the-art platform. Secure, fast, and designed for modern investors.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button size="lg" className="h-12 px-8 text-lg" onClick={() => navigate('/register')}>
                                Open Account
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                                View Funds
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-20 overflow-hidden">
                    <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-[40%] right-[20%] w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 bg-accent/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Bank-Grade Security</h3>
                            <p className="text-muted-foreground">
                                Your data and investments are protected by state-of-the-art encryption and regulatory compliance protocols.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Mobile & Web</h3>
                            <p className="text-muted-foreground">
                                Seamlessly switch between devices. Your portfolio follows you wherever you go with our cross-platform experience.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Digital Onboarding</h3>
                            <p className="text-muted-foreground">
                                Open an account in minutes with our fully digital KYC process. No paperwork, no physical visits required.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to start your journey?</h2>
                    <p className="text-muted-foreground mb-8 text-lg">
                        Join thousands of investors already growing their wealth with us. It takes less than 5 minutes to get started.
                    </p>
                    <Button size="lg" onClick={() => navigate('/register')}>
                        Create Free Account
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 border-t border-border/40 text-center text-muted-foreground text-sm">
                <p>© 2025 StockMarket Platform. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
