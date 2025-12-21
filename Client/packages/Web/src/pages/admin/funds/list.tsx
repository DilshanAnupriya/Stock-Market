import { useEffect, useState } from "react";
import { Plus, Edit, Trash } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { fundService } from "../../../services/fundService";
import { useToast } from "../../../components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";

export default function AdminFundList() {
    const { toast } = useToast();
    const [funds, setFunds] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFunds = async () => {
        setIsLoading(true);
        try {
            const res = await fundService.getAllFunds();
            setFunds(res.data);
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to load funds", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFunds();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Fund Management</h1>
                <CreateFundDialog onSuccess={fetchFunds} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Funds</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>NAV (LKR)</TableHead>
                                    <TableHead>Risk</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {funds.map((fund) => (
                                    <TableRow key={fund._id}>
                                        <TableCell className="font-medium">{fund.name}</TableCell>
                                        <TableCell>{fund.code}</TableCell>
                                        <TableCell className="capitalize">{fund.type}</TableCell>
                                        <TableCell>{fund.currentNAV}</TableCell>
                                        <TableCell className="capitalize">{fund.riskLevel}</TableCell>
                                        <TableCell>
                                            <Badge variant={fund.isActive ? "default" : "secondary"}>
                                                {fund.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <EditFundDialog fund={fund} onSuccess={fetchFunds} />
                                                <Button variant="ghost" size="sm" className="text-red-500">
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function EditFundDialog({ fund, onSuccess }: { fund: any; onSuccess: () => void }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: fund.name,
        code: fund.code,
        type: fund.type,
        description: fund.description,
        minimumInvestment: fund.minimumInvestment,
        currentNAV: fund.currentNAV,
        inceptionDate: fund.inceptionDate ? new Date(fund.inceptionDate).toISOString().split('T')[0] : "",
        fundManager: fund.fundManager,
        riskLevel: fund.riskLevel,
        isActive: fund.isActive
    });

    const handleChange = (e: any) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? parseFloat(value) : value
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fundService.updateFund(fund._id, formData);
            toast({ title: "Success", description: "Fund updated successfully" });
            setOpen(false);
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update fund",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Fund: {fund.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Fund Name</Label>
                            <Input id="edit-name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-code">Fund Code</Label>
                            <Input id="edit-code" name="code" value={formData.code} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-type">Fund Type</Label>
                            <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="money-market">Money Market</SelectItem>
                                    <SelectItem value="equity">Equity</SelectItem>
                                    <SelectItem value="bond">Bond</SelectItem>
                                    <SelectItem value="balanced">Balanced</SelectItem>
                                    <SelectItem value="index">Index</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-riskLevel">Risk Level</Label>
                            <Select value={formData.riskLevel} onValueChange={(val) => setFormData({ ...formData, riskLevel: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select risk level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea id="edit-description" name="description" value={formData.description} onChange={handleChange} required />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-minimumInvestment">Min. Investment (LKR)</Label>
                            <Input id="edit-minimumInvestment" name="minimumInvestment" type="number" value={formData.minimumInvestment} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-currentNAV">Current NAV (LKR)</Label>
                            <Input id="edit-currentNAV" name="currentNAV" type="number" step="0.0001" value={formData.currentNAV} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-inceptionDate">Inception Date</Label>
                            <Input id="edit-inceptionDate" name="inceptionDate" type="date" value={formData.inceptionDate} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-fundManager">Fund Manager</Label>
                            <Input id="edit-fundManager" name="fundManager" value={formData.fundManager} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-isActive">Status</Label>
                            <Select value={formData.isActive ? "true" : "false"} onValueChange={(val) => setFormData({ ...formData, isActive: val === "true" })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CreateFundDialog({ onSuccess }: { onSuccess: () => void }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        type: "money-market",
        description: "",
        minimumInvestment: 1000,
        currentNAV: 1.0,
        inceptionDate: new Date().toISOString().split('T')[0],
        fundManager: "",
        riskLevel: "low"
    });

    const handleChange = (e: any) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? parseFloat(value) : value
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fundService.createFund(formData);
            toast({ title: "Success", description: "Fund created successfully" });
            setOpen(false);
            setFormData({
                name: "",
                code: "",
                type: "money-market",
                description: "",
                minimumInvestment: 1000,
                currentNAV: 1.0,
                inceptionDate: new Date().toISOString().split('T')[0],
                fundManager: "",
                riskLevel: "low"
            });
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create fund",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Fund
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Fund</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Fund Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Fund Code</Label>
                            <Input id="code" name="code" value={formData.code} onChange={handleChange} required placeholder="e.g. JB-MMF" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Fund Type</Label>
                            <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="money-market">Money Market</SelectItem>
                                    <SelectItem value="equity">Equity</SelectItem>
                                    <SelectItem value="bond">Bond</SelectItem>
                                    <SelectItem value="balanced">Balanced</SelectItem>
                                    <SelectItem value="index">Index</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="riskLevel">Risk Level</Label>
                            <Select value={formData.riskLevel} onValueChange={(val) => setFormData({ ...formData, riskLevel: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select risk level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minimumInvestment">Min. Investment (LKR)</Label>
                            <Input id="minimumInvestment" name="minimumInvestment" type="number" value={formData.minimumInvestment} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currentNAV">Initial NAV (LKR)</Label>
                            <Input id="currentNAV" name="currentNAV" type="number" step="0.0001" value={formData.currentNAV} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="inceptionDate">Inception Date</Label>
                            <Input id="inceptionDate" name="inceptionDate" type="date" value={formData.inceptionDate} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fundManager">Fund Manager</Label>
                        <Input id="fundManager" name="fundManager" value={formData.fundManager} onChange={handleChange} required />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Fund"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
