import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Settings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [alias, setAlias] = useState(user?.alias || "");
  const [selectedPlan, setSelectedPlan] = useState<string>(user?.subscriptionTier || "free");

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; alias: string }) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
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

  const updatePlanMutation = useMutation({
    mutationFn: async (plan: string) => {
      const response = await fetch("/api/user/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update plan");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Plan updated",
        description: "Your subscription plan has been updated successfully.",
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

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      firstName,
      lastName,
      alias,
    });
  };

  const handlePlanUpdate = () => {
    if (selectedPlan === user?.subscriptionTier) {
      toast({
        title: "No changes",
        description: "You're already on this plan.",
      });
      return;
    }
    updatePlanMutation.mutate(selectedPlan);
  };

  const getPlanDetails = (tier: string) => {
    switch (tier) {
      case "free":
        return { name: "Free", dailyLimit: 2, monthlyLimit: 10, price: "$0" };
      case "starter_trader":
        return { name: "Starter Trader", dailyLimit: 10, monthlyLimit: 60, price: "$29" };
      case "pro_trader":
        return { name: "Pro Trader", dailyLimit: "Unlimited", monthlyLimit: "Unlimited", price: "$99" };
      default:
        return { name: "Unknown", dailyLimit: 0, monthlyLimit: 0, price: "$0" };
    }
  };

  const currentPlanDetails = getPlanDetails(user?.subscriptionTier || "free");

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
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-400">Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Settings */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5 text-blue-500" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-200">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-200">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alias" className="text-slate-200">
                    Alias (Optional)
                  </Label>
                  <Input
                    id="alias"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Choose a display name"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Plan Management */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CreditCard className="h-5 w-5 text-blue-500" />
                Subscription Plan
              </CardTitle>
              <CardDescription>Manage your subscription tier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Current Plan</h3>
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-white">{currentPlanDetails.name}</h4>
                    <span className="text-2xl font-bold text-blue-500">{currentPlanDetails.price}</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    {typeof currentPlanDetails.dailyLimit === "number"
                      ? `${currentPlanDetails.dailyLimit} signals per day`
                      : "Unlimited daily signals"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {typeof currentPlanDetails.monthlyLimit === "number"
                      ? `${currentPlanDetails.monthlyLimit} signals per month`
                      : "Unlimited monthly signals"}
                  </p>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Change Plan */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">Change Plan</h3>
                <div className="space-y-3">
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="free" className="text-white">
                        Free - $0/month (2/day, 10/month)
                      </SelectItem>
                      <SelectItem value="starter_trader" className="text-white">
                        Starter Trader - $29/month (10/day, 60/month)
                      </SelectItem>
                      <SelectItem value="pro_trader" className="text-white">
                        Pro Trader - $99/month (Unlimited)
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handlePlanUpdate}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={updatePlanMutation.isPending || selectedPlan === user?.subscriptionTier}
                  >
                    {updatePlanMutation.isPending ? "Updating..." : "Update Plan"}
                  </Button>
                </div>
              </div>

              {/* Plan Comparison */}
              <div className="text-xs text-slate-400 space-y-1 pt-4 border-t border-slate-700">
                <p>• Free: Perfect for trying out the platform</p>
                <p>• Starter: For serious traders with consistent needs</p>
                <p>• Pro: Unlimited access for professional trading</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card className="bg-slate-900/50 border-slate-800 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Phone</p>
              <p className="text-white">{user?.phoneNumber || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Account Created</p>
              <p className="text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Email Verified</p>
              <p className="text-white">{user?.emailVerified ? "Yes" : "No"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
