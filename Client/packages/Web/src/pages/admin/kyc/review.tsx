import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "../../../services/adminService";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useToast } from "../../../components/ui/use-toast";
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Textarea } from "../../../components/ui/textarea";

export default function AdminKYCReview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Determine if we need to fetch user details (which includes account/kyc data)
                // The API endpoint structure in adminController.js suggests:
                // getUserDetails returns { user, account }
                // BUT we likely need to fetch the ACCOUNT directly if we have the account ID from the list.
                // However, adminService doesn't have getAccountById explicitly exposed in the snippet I wrote.
                // Checking adminService.ts... ah, I didn't add getKYCDetails.
                // Let's assume for now we use getUserDetails if we had userId, OR we add a route.
                // Wait, reviewing previous code...
                // adminController.js has reviewKYC (PUT /kyc/:id/review) - works with Account ID.
                // But it doesn't have 'getKYCDetails'.
                // adminController HAS 'getUserDetails' which returns {user, account}.

                // CRITICAL MISS: I don't have an endpoint to get a single KYC application by Account ID in adminController.
                // I only have getUserDetails (by User ID).
                // But the list returns Accounts.
                // I'll need to fetch the User Details using the user ID from the account, 
                // OR I need to add an endpoint to get Account by ID.

                // Looking at adminController.js again:
                // It has `getFundDetails` but no `getAccountDetails`.

                // FIX: I will use `getUserDetails` but I first need the User ID.
                // The list page has `app.user`. But on direct load of this page by ID (Account ID), I can't get it easily.
                // Actually, wait. I can use the existing `accountService`? No, that's for 'my' account.

                // WORKAROUND: For now, I will assume the `getUserDetails` gets everything needed, but I need the USER ID. 
                // Wait, the param `id` here is the ACCOUNT ID because `AdminKYCList` links to `/admin/kyc/${app._id}`.

                // I should add `getAccountDetails` to the backend or use `getUserDetails` if I can find the user ID.
                // Let's modify the PLAN: I'll add `getKYCApplication` to the backend controller later if needed.
                // OR, checking `adminController.js`: `getUserDetails` takes `req.params.id` (User ID).

                // Quick Fix: I will modify `adminController.js` to allow fetching account by ID or just add a valid endpoint.
                // Or I can use `adminService.getUsers()` to find the user? No, inefficient.

                // Let's check `adminRoutes.js`: `router.get('/users/:id', adminController.getUserDetails);`

                // Ideally, I should add `router.get('/kyc/:id', adminController.getKYCDetails);`.
                // For this step, I'll write the frontend code assuming I can get the data.
                // I will add a method to `adminService` that fetches user details if I pass a User ID, 
                // but since I have Account ID, I'm stuck.

                // Let's assume I'll fix the backend in the next step to add `getKYCDetails`.
                // So I will write this component assuming `adminService.getKYCDetails(id)` exists.

                const res = await adminService.getKYCDetails(id!);
                setData(res.data.data);
            } catch (err) {
                console.error(err);
                toast({ title: "Error", description: "Failed to load application", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAction = async (action: 'approve' | 'reject') => {
        if (action === 'reject' && !showRejectInput) {
            setShowRejectInput(true);
            return;
        }

        if (action === 'reject' && !rejectionReason.trim()) {
            toast({ title: "Error", description: "Please provide a reason for rejection", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        try {
            await adminService.reviewKYC(id!, {
                action,
                rejectionReason: action === 'reject' ? rejectionReason : undefined
            });
            toast({ title: "Success", description: `Application ${action}d successfully` });
            navigate("/admin/kyc");
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Action failed",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!data) return <div className="p-8 text-center">Application not found</div>;

    // Helper to render field
    const Field = ({ label, value }: any) => (
        <div className="mb-4">
            <span className="text-sm font-medium text-muted-foreground block">{label}</span>
            <span className="text-base">{value || "-"}</span>
        </div>
    );

    // Helper to render image link
    const DocLink = ({ label, path }: any) => (
        <div className="mb-4 p-4 border rounded-lg">
            <span className="text-sm font-medium block mb-2">{label}</span>
            {path ? (
                <a
                    href={`http://localhost:3000/${path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                >
                    View Document <ExternalLink className="ml-2 h-4 w-4" />
                </a>
            ) : (
                <span className="text-muted-foreground">Not uploaded</span>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Review KYC Application</h1>
                <Button variant="outline" onClick={() => navigate("/admin/kyc")}>Back to List</Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                    <CardContent>
                        <Field label="Full Name" value={data.fullName} />
                        <Field label="NIC" value={data.nicNumber} />
                        <Field label="Date of Birth" value={data.dob ? new Date(data.dob).toLocaleDateString() : '-'} />
                        <Field label="Address" value={`${data.address}, ${data.city}`} />
                        <Field label="Mobile" value={data.contactNumber || data.user?.mobile} />
                        <Field label="Email" value={data.user?.email} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
                    <CardContent>
                        <DocLink label="NIC Front" path={data.nicFrontImage} />
                        <DocLink label="NIC Back" path={data.nicBackImage} />
                        <DocLink label="Billing Proof" path={data.billingProofImage} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Employment</CardTitle></CardHeader>
                    <CardContent>
                        <Field label="Occupation" value={data.employmentDetails?.occupation} />
                        <Field label="Employer" value={data.employmentDetails?.employer} />
                        <Field label="Income Source" value={data.employmentDetails?.monthlyIncome} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
                    <CardContent>
                        <Field label="Bank Name" value={data.bankDetails?.bankName} />
                        <Field label="Branch" value={data.bankDetails?.branchName} />
                        <Field label="Account Number" value={data.bankDetails?.accountNumber} />
                        <DocLink label="Bank Passbook" path={data.bankDetails?.bankBookImage} />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-t-4 border-primary">
                <CardHeader><CardTitle>Review Action</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {showRejectInput && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Rejection Reason</label>
                            <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Explain why the application is being rejected..."
                            />
                        </div>
                    )}

                    <div className="flex gap-4">
                        {!showRejectInput && (
                            <Button
                                onClick={() => handleAction('approve')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={isProcessing}
                            >
                                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                Approve Application
                            </Button>
                        )}

                        <Button
                            onClick={() => handleAction('reject')}
                            variant="destructive"
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <XCircle className="mr-2 h-4 w-4" />}
                            {showRejectInput ? "Confirm Rejection" : "Reject Application"}
                        </Button>

                        {showRejectInput && (
                            <Button variant="ghost" onClick={() => setShowRejectInput(false)}>Cancel</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
