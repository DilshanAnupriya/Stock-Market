import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { accountService } from "../../../services/accountService";
import { useToast } from "../../../components/ui/use-toast";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";

export default function Step8VideoKYC() {
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
                title: "Missing Video",
                description: "Please upload a KYC video.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append("videoKYC", file);

        try {
            await accountService.uploadVideoKYC(formData);
            toast({
                title: "Upload Successful",
                description: "Video KYC uploaded successfully.",
                variant: "success",
            });
            navigate("/kyc/declaration");
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Upload Failed",
                description: error.response?.data?.message || "Failed to upload video.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Video KYC</CardTitle>
                <CardDescription>
                    Upload a short video of yourself holding your NIC and stating your name.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="videoKYC">Video File (Max 100MB)</Label>
                        <Input id="videoKYC" type="file" accept="video/*" onChange={handleFileChange} />
                        {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" type="button" onClick={() => navigate("/kyc/nominee")}>
                            Back
                        </Button>
                        <Button type="submit" disabled={isLoading || !file}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Next: Declaration
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
