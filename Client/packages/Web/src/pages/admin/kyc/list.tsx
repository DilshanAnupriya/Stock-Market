import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../../services/adminService";
import { Eye, FileCheck } from "lucide-react";
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

export default function AdminKYCList() {
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await adminService.getPendingKYC();
            setApplications(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">KYC Applications</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Pending Review</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No pending KYC applications found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app._id}>
                                        <TableCell>
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{app.user?.username}</span>
                                                <span className="text-xs text-muted-foreground">{app.user?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={app.applicationStatus === "under-review" ? "warning" : "default"}>
                                                {app.applicationStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/admin/kyc/${app._id}`}>
                                                <Button size="sm" variant="outline">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Review
                                                </Button>
                                            </Link>
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
