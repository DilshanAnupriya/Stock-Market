import { useState, useEffect } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { accountService } from "../../../services/accountService";
import { useToast } from "../../../components/ui/use-toast";
import api from "../../../services/api"; // To fetch funds

const declarationSchema = z.object({
    accepted: z.boolean().refine((val) => val === true, "You must accept the declaration"),
    selectedFunds: z.array(z.string()).min(1, "Please select at least one fund"),
});

type DeclarationFormValues = z.infer<typeof declarationSchema>;

export default function Step9Declaration() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [funds, setFunds] = useState<any[]>([]);

    const form = useForm<DeclarationFormValues>({
        resolver: zodResolver(declarationSchema),
        defaultValues: {
            accepted: false,
            selectedFunds: [],
        },
    });

    useEffect(() => {
        // Fetch available funds
        const fetchFunds = async () => {
            try {
                const res = await api.get('/funds');
                // Assuming response structure: { data: funds } or array
                setFunds(res.data.data || res.data || []);
            } catch (err) {
                console.error("Failed to fetch funds", err);
            }
        }
        fetchFunds();
    }, []);

    async function onSubmit(data: DeclarationFormValues) {
        setIsLoading(true);
        try {
            await accountService.submitDeclaration(data);
            toast({
                title: "Account Created!",
                description: "Your KYC details have been submitted for verification.",
                variant: "success",
            });
            navigate("/dashboard");
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to submit declaration.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Declaration</CardTitle>
                <CardDescription>Final step. Please review and accept the terms.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-4">
                            <h4 className="font-medium">Select Funds Needed</h4>
                            {funds.length === 0 ? (
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                    No funds available at the moment. Please contact support if this persists.
                                    <br />
                                    <span className="text-xs text-muted-foreground">(Selecting a dummy fund for now if none exist to allow testing)</span>
                                </p>
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="selectedFunds"
                                    render={() => (
                                        <FormItem>
                                            {funds.map((fund) => (
                                                <FormField
                                                    key={fund._id}
                                                    control={form.control}
                                                    name="selectedFunds"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={fund._id}
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                        checked={field.value?.includes(fund._id)}
                                                                        onChange={(checked) => {
                                                                            return checked.target.checked
                                                                                ? field.onChange([...field.value, fund._id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== fund._id
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    {fund.name}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="accepted"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={field.onChange}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            I hereby declare that the information provided is true and accurate.
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            By clicking submit, you agree to our Terms of Service and Privacy Policy.
                                        </p>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between mt-6">
                            <Button variant="outline" type="button" onClick={() => navigate("/kyc/video")}>
                                Back
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Application
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
