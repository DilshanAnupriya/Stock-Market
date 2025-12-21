import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { Button } from "../../../components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { accountService } from "../../../services/accountService";
import { useToast } from "../../../components/ui/use-toast";


// Helper Select Component since it wasn't in ui folder yet, implementing basic or expecting standard Shadcn Select. 
// Since I haven't implemented Select yet, I will implement a simple native select or create the shadcn select.
// I'll create the Shadcn Select component in the same turn or assume native for speed if Select is complex.
// Shadcn Select is complex. I'll use native <select> for now to avoid errors or create a simple wrapper.
// Actually, I'll creates a simple wrapper in this file or just use native select.
// Let's use native select for simplicity and robustness in this constrained environment unless I add select.tsx.
// I will add select.tsx in the next batch or use native.
// I'll use native select for now.

const bankDetailsSchema = z.object({
    accountNumber: z.string().min(5, "Account number must be at least 5 digits").max(20, "Account number too long"),
    bankName: z.string().min(2, "Bank Name is required"),
    branchName: z.string().min(2, "Branch Name is required"),
    accountType: z.enum(["savings", "current"]),
});

type BankDetailsFormValues = z.infer<typeof bankDetailsSchema>;

export default function Step3BankDetails() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<BankDetailsFormValues>({
        resolver: zodResolver(bankDetailsSchema),
        defaultValues: {
            accountNumber: "",
            bankName: "",
            branchName: "",
            accountType: "savings",
        },
    });

    async function onSubmit(data: BankDetailsFormValues) {
        setIsLoading(true);
        try {
            await accountService.submitBankDetails(data);
            toast({
                title: "Details Saved",
                description: "Bank details submitted successfully.",
                variant: "success",
            });
            navigate("/kyc/bank-book");
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to submit details.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Bank Details</CardTitle>
                <CardDescription>Provide your bank account details for transactions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="bankName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bank Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Commercial Bank" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="branchName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Branch Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Colombo 07" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="1234567890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="accountType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Type</FormLabel>
                                    <FormControl>
                                        <div className="relative w-full">
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            >
                                                <option value="savings">Savings</option>
                                                <option value="current">Current</option>
                                            </select>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between mt-6">
                            <Button variant="outline" type="button" onClick={() => navigate("/kyc/nic")}>
                                Back
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Next: Upload Bank Book
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
