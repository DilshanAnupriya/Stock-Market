import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { accountService } from "../../../services/accountService";
import { useToast } from "../../../components/ui/use-toast";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";

export default function Step4BankBook() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast({
                title: "Missing File",
                description: "Please upload a copy of your bank book.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append("bankBook", file);

        try {
            await accountService.uploadBankBook(formData);
            toast({
                title: "Upload Successful",
                description: "Bank book uploaded successfully.",
                variant: "success",
            });
            navigate("/kyc/billing");
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Upload Failed",
                description: error.response?.data?.message || "Failed to upload document.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload Bank Book</CardTitle>
                <CardDescription>Upload a clear image of the first page of your bank passbook.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="bankBook">Bank Book Image</Label>
                        <Input id="bankBook" type="file" accept="image/*,.pdf" onChange={handleFileChange} />
                        {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" type="button" onClick={() => navigate("/kyc/bank")}>
                            Back
                        </Button>
                        <Button type="submit" disabled={isLoading || !file}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Next: Billing Proof
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
