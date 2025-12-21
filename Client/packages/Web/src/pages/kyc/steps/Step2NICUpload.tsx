import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { accountService } from "../../../services/accountService";
import { useToast } from "../../../components/ui/use-toast";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";

export default function Step2NICUpload() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [nicFront, setNicFront] = useState<File | null>(null);
    const [nicBack, setNicBack] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nicFront || !nicBack) {
            toast({
                title: "Missing Files",
                description: "Please upload both front and back of your NIC.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append("nicFront", nicFront);
        formData.append("nicBack", nicBack);

        try {
            await accountService.uploadNIC(formData);
            toast({
                title: "Upload Successful",
                description: "NIC documents uploaded successfully.",
                variant: "success",
            });
            navigate("/kyc/bank");
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Upload Failed",
                description: error.response?.data?.message || "Failed to upload documents.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload NIC</CardTitle>
                <CardDescription>Please upload clear photos of your National Identity Card (Front and Back).</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="nicFront">NIC Front</Label>
                        <div className="flex items-center gap-4">
                            <Input id="nicFront" type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setNicFront)} />
                        </div>
                        {nicFront && <p className="text-xs text-muted-foreground">{nicFront.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nicBack">NIC Back</Label>
                        <div className="flex items-center gap-4">
                            <Input id="nicBack" type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setNicBack)} />
                        </div>
                        {nicBack && <p className="text-xs text-muted-foreground">{nicBack.name}</p>}
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" type="button" onClick={() => navigate("/kyc/personal")}>
                            Back
                        </Button>
                        <Button type="submit" disabled={isLoading || !nicFront || !nicBack}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Next Step: Bank Details
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
