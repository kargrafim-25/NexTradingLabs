import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, CheckCircle, XCircle, DollarSign, Clock } from "lucide-react";
import { useLocation } from "wouter";

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  subscriptionTier: string;
  isActive: boolean;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  dailyCredits: number;
  monthlyCredits: number;
  maxDailyCredits: number;
  maxMonthlyCredits: number;
  createdAt: string;
}

interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  requestedPlan: 'starter_trader' | 'pro_trader';
  subscriptionPeriod: number;
  referenceCode: string;
  amount: string;
  originalAmount: string;
  discountPercentage: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
  whatsappNumber: string | null;
  createdAt: string;
  completedAt: string | null;
  completedByAdminId: string | null;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return response.json();
    },
    enabled: user?.subscriptionTier === 'admin'
  });

  // Fetch payment requests
  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: async () => {
      const response = await fetch('/api/admin/payment-requests', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment requests');
      }
      
      return response.json();
    },
    enabled: user?.subscriptionTier === 'admin',
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ userId, plan }: { userId: string; plan: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update plan');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: "Plan updated",
        description: "User plan has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: "Status updated",
        description: "User status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async ({ paymentId }: { paymentId: string }) => {
      const response = await fetch(`/api/admin/payment-requests/${paymentId}/confirm`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to confirm payment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: "Payment confirmed",
        description: "User has been upgraded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelPaymentMutation = useMutation({
    mutationFn: async ({ paymentId }: { paymentId: string }) => {
      const response = await fetch(`/api/admin/payment-requests/${paymentId}/cancel`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel payment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      toast({
        title: "Payment cancelled",
        description: "Payment request has been cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getPlanBadgeColor = (tier: string) => {
    switch (tier) {
      case 'admin': return 'bg-purple-600';
      case 'pro_trader': return 'bg-yellow-600';
      case 'starter_trader': return 'bg-blue-600';
      default: return 'bg-slate-600';
    }
  };

  const getPlanDisplayName = (tier: string) => {
    switch (tier) {
      case 'admin': return 'Admin';
      case 'pro_trader': return 'Pro Trader';
      case 'starter_trader': return 'Starter Trader';
      case 'free': return 'Free';
      default: return tier;
    }
  };

  if (user?.subscriptionTier !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <p className="text-white">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/")}
            className="border-slate-700 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-500" />
              User Management
            </h1>
            <p className="text-slate-400">Manage all user accounts and subscriptions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl text-white">
                {usersData?.users?.length || 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription>Active Users</CardDescription>
              <CardTitle className="text-3xl text-green-500">
                {usersData?.users?.filter((u: User) => u.isActive).length || 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription>Paid Users</CardDescription>
              <CardTitle className="text-3xl text-blue-500">
                {usersData?.users?.filter((u: User) => u.subscriptionTier !== 'free').length || 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 border-yellow-500/50">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-yellow-500" />
                Pending Payments
              </CardDescription>
              <CardTitle className="text-3xl text-yellow-500">
                {paymentsData?.paymentRequests?.filter((p: PaymentRequest) => p.status === 'pending').length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Pending Payments Section */}
        {paymentsData?.paymentRequests?.filter((p: PaymentRequest) => p.status === 'pending').length > 0 && (
          <Card className="bg-slate-900/50 border-yellow-500/50 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-500" />
                Pending Payment Requests
              </CardTitle>
              <CardDescription>Review and confirm customer payments from WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPayments ? (
                <p className="text-slate-400">Loading payments...</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">User</TableHead>
                        <TableHead className="text-slate-300">Plan</TableHead>
                        <TableHead className="text-slate-300">Period</TableHead>
                        <TableHead className="text-slate-300">Amount</TableHead>
                        <TableHead className="text-slate-300">Reference Code</TableHead>
                        <TableHead className="text-slate-300">Requested</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentsData?.paymentRequests
                        ?.filter((p: PaymentRequest) => p.status === 'pending')
                        .map((payment: PaymentRequest) => (
                        <TableRow key={payment.id} className="border-slate-700">
                          <TableCell className="text-white">
                            <div>
                              <p className="font-medium">{payment.userEmail}</p>
                              <p className="text-xs text-slate-400">User ID: {payment.userId.slice(0, 8)}...</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPlanBadgeColor(payment.requestedPlan)}>
                              {getPlanDisplayName(payment.requestedPlan)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {payment.subscriptionPeriod === 1 ? '1 month' : payment.subscriptionPeriod === 3 ? '3 months' : '1 year'}
                          </TableCell>
                          <TableCell>
                            <div className="text-white">
                              <p className="font-bold text-green-500">${payment.amount}</p>
                              {payment.discountPercentage > 0 && (
                                <p className="text-xs text-slate-400">
                                  <span className="line-through">${payment.originalAmount}</span>
                                  <Badge className="ml-1 bg-green-600 text-white text-xs">{payment.discountPercentage}% off</Badge>
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-600 text-white font-mono">
                              {payment.referenceCode}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3" />
                              {new Date(payment.createdAt).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => confirmPaymentMutation.mutate({ paymentId: payment.id })}
                                disabled={confirmPaymentMutation.isPending}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => cancelPaymentMutation.mutate({ paymentId: payment.id })}
                                disabled={cancelPaymentMutation.isPending}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">All Users</CardTitle>
            <CardDescription>View and manage all user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-slate-400">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Name</TableHead>
                      <TableHead className="text-slate-300">Plan</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Credits</TableHead>
                      <TableHead className="text-slate-300">Verified</TableHead>
                      <TableHead className="text-slate-300">Joined</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.users?.map((u: User) => (
                      <TableRow key={u.id} className="border-slate-700">
                        <TableCell className="text-white">{u.email}</TableCell>
                        <TableCell className="text-slate-300">
                          {u.firstName} {u.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPlanBadgeColor(u.subscriptionTier)}>
                            {getPlanDisplayName(u.subscriptionTier)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.isActive ? (
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-600">
                              <XCircle className="h-3 w-3 mr-1" />
                              Blocked
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {u.dailyCredits}/{u.maxDailyCredits} daily
                          <br />
                          {u.monthlyCredits}/{u.maxMonthlyCredits} monthly
                        </TableCell>
                        <TableCell>
                          {u.emailVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <Select
                              value={u.subscriptionTier}
                              onValueChange={(value) =>
                                updatePlanMutation.mutate({ userId: u.id, plan: value })
                              }
                            >
                              <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="free" className="text-white text-xs">Free</SelectItem>
                                <SelectItem value="starter_trader" className="text-white text-xs">Starter</SelectItem>
                                <SelectItem value="pro_trader" className="text-white text-xs">Pro</SelectItem>
                                <SelectItem value="admin" className="text-white text-xs">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant={u.isActive ? "destructive" : "default"}
                              className="text-xs"
                              onClick={() =>
                                updateStatusMutation.mutate({ userId: u.id, isActive: !u.isActive })
                              }
                            >
                              {u.isActive ? 'Disable' : 'Activate'}
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs"
                              onClick={() => {
                                if (window.confirm(`Delete user ${u.email}? This cannot be undone.`)) {
                                 fetch(`/api/admin/users/${u.id}`, {
                                   method: 'DELETE',
                                   credentials: 'include'
                                 })
                                 .then(res => res.json())
                                 .then(data => {
                                   if (data.success) {
                                    toast({
                                     title: 'User Deleted',
                                     description: 'User has been permanently deleted'
                                    });
                                    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
                                   }
                                  })
                                  .catch(err => toast({
                                   title: 'Error',
                                   description: err.message,
                                   variant: 'destructive'
                                  }));
                                 }
                               }}
                             >
                              Delete
                             </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
