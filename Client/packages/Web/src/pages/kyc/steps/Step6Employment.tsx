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


// Defining schema based on backend validation
const employmentDetailsSchema = z.object({
    occupation: z.string().min(2, "Occupation is required"),
    employer: z.string().optional(),
    monthlyIncome: z.enum(['below-50k', '50k-100k', '100k-250k', '250k-500k', 'above-500k']),
    modeOfTransaction: z.enum(['online', 'branch', 'both']),
    isPEP: z.boolean(),
});

type EmploymentDetailsFormValues = z.infer<typeof employmentDetailsSchema>;

export default function Step6Employment() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<EmploymentDetailsFormValues>({
        resolver: zodResolver(employmentDetailsSchema),
        defaultValues: {
            occupation: "",
            employer: "",
            monthlyIncome: "below-50k",
            modeOfTransaction: "online",
            isPEP: false,
        },
    });

    async function onSubmit(data: EmploymentDetailsFormValues) {
        setIsLoading(true);
        try {
            await accountService.submitEmploymentDetails(data);
            toast({
                title: "Details Saved",
                description: "Employment details submitted successfully.",
                variant: "success",
            });
            navigate("/kyc/nominee");
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
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Employment Details</CardTitle>
                <CardDescription>We need this information to comply with regulations.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="occupation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Occupation</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Software Engineer" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="employer"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employer (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Company Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="monthlyIncome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monthly Income</FormLabel>
                                    <FormControl>
                                        <div className="relative w-full">
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            >
                                                <option value="below-50k">Below 50,000 LKR</option>
                                                <option value="50k-100k">50,000 - 100,000 LKR</option>
                                                <option value="100k-250k">100,000 - 250,000 LKR</option>
                                                <option value="250k-500k">250,000 - 500,000 LKR</option>
                                                <option value="above-500k">Above 500,000 LKR</option>
                                            </select>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="modeOfTransaction"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preferred Mode of Transaction</FormLabel>
                                    <FormControl>
                                        <div className="relative w-full">
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            >
                                                <option value="online">Online</option>
                                                <option value="branch">Branch</option>
                                                <option value="both">Both</option>
                                            </select>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isPEP"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={field.onChange}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Are you a Politically Exposed Person (PEP)?
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            This includes individuals who form prominent public functions.
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between mt-6">
                            <Button variant="outline" type="button" onClick={() => navigate("/kyc/billing")}>
                                Back
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Next: Nominee Details
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
