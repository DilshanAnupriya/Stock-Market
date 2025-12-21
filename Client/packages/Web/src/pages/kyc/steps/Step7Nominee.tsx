import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Trash2 } from "lucide-react";

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

// Schema for a single nominee
const singleNomineeSchema = z.object({
    name: z.string().min(2, "Name is required"),
    relationship: z.string().min(2, "Relationship is required"),
    nic: z.string().min(10, "Valid NIC is required"),
    contactNumber: z.string().optional(),
    percentage: z.number().min(1).max(100),
});

const nomineeSchema = z.object({
    nominees: z.array(singleNomineeSchema).min(1, "At least one nominee is required"),
});

type NomineeFormValues = z.infer<typeof nomineeSchema>;

export default function Step7Nominee() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<NomineeFormValues>({
        resolver: zodResolver(nomineeSchema),
        defaultValues: {
            nominees: [
                { name: "", relationship: "", nic: "", contactNumber: "", percentage: 100 }
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "nominees",
    });

    async function onSubmit(data: NomineeFormValues) {
        // Validate total percentage
        const totalPercentage = data.nominees.reduce((sum, n) => sum + n.percentage, 0);
        if (totalPercentage !== 100) {
            toast({
                title: "Invalid Percentage",
                description: `Total percentage must be 100%. Current total: ${totalPercentage}%`,
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            await accountService.addNominee(data);
            toast({
                title: "Details Saved",
                description: "Nominee details submitted successfully.",
                variant: "success",
            });
            navigate("/kyc/video");
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
                <CardTitle>Nominee Details</CardTitle>
                <CardDescription>Nominate beneficiaries for your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {fields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-md space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-medium">Nominee {index + 1}</h4>
                                    {fields.length > 1 && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`nominees.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Jane Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`nominees.${index}.relationship`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Relationship</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Spouse" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`nominees.${index}.nic`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>NIC Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="NIC Number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`nominees.${index}.percentage`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Percentage (%)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => append({ name: "", relationship: "", nic: "", contactNumber: "", percentage: 0 })}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Nominee
                        </Button>

                        <div className="flex justify-between mt-6">
                            <Button variant="outline" type="button" onClick={() => navigate("/kyc/employment")}>
                                Back
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Next: Video KYC
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
