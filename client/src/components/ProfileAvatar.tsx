import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { User, Settings, CreditCard, LogOut, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ProfileAvatarProps {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    subscriptionTier: string;
    profileImageUrl?: string | null;
  } | null | undefined;
  onLogout: () => void;
}

// Predefined avatar options with 3D character images
const AVATAR_OPTIONS = [
  { id: 'female1', image: '/avatars/female1.jpg', label: 'Avatar 1' },
  { id: 'female2', image: '/avatars/female2.jpg', label: 'Avatar 2' },
  { id: 'female3', image: '/avatars/female3.jpg', label: 'Avatar 3' },
  { id: 'female4', image: '/avatars/female4.jpg', label: 'Avatar 4' },
  { id: 'male1', image: '/avatars/male1.jpg', label: 'Avatar 5' },
  { id: 'male2', image: '/avatars/male2.jpg', label: 'Avatar 6' },
  { id: 'male3', image: '/avatars/male3.jpg', label: 'Avatar 7' },
  { id: 'male4', image: '/avatars/male4.jpg', label: 'Avatar 8' }
];

export default function ProfileAvatar({ user, onLogout }: ProfileAvatarProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState('female1');
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);

  // Load saved avatar from user profile on mount
  useEffect(() => {
    if (user?.profileImageUrl) {
      setSelectedAvatar(user.profileImageUrl);
    }
  }, [user?.profileImageUrl]);

  // Save avatar selection to backend
  const handleAvatarSelect = async (avatarId: string) => {
    setSelectedAvatar(avatarId);
    setShowAvatarDialog(false);
    
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ profileImageUrl: avatarId })
      });

      if (response.ok) {
        // Invalidate user query to refresh the user data with new avatar
        await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        
        toast({
          title: "Avatar updated",
          description: "Your profile avatar has been saved successfully.",
        });
      } else {
        throw new Error('Failed to save avatar');
      }
    } catch (error) {
      console.error('Failed to save avatar:', error);
      // Revert to previous avatar on error
      if (user?.profileImageUrl) {
        setSelectedAvatar(user.profileImageUrl);
      }
      toast({
        title: "Error",
        description: "Failed to save avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentAvatar = AVATAR_OPTIONS.find(avatar => avatar.id === selectedAvatar);

  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
      case 'pro_trader':
        return 'bg-gradient-to-r from-secondary to-accent text-white';
      case 'starter_trader':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSubscriptionLabel = (tier: string) => {
    switch (tier) {
      case 'admin':
        return 'Admin';
      case 'pro_trader':
        return 'Pro Trader';
      case 'starter_trader':
        return 'Starter Trader';
      default:
        return 'Free User';
    }
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0" data-testid="button-profile-avatar">
            <div className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform overflow-hidden border-2 border-primary">
              {currentAvatar?.image ? (
                <img src={currentAvatar.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">👤</span>
              )}
            </div>
            {/* Subscription tier indicator */}
            {user.subscriptionTier !== 'free' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center">
                <Crown className="w-2 h-2 text-white" />
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              <Badge 
                className={`w-fit text-xs ${getSubscriptionBadgeColor(user.subscriptionTier)}`}
                data-testid="badge-profile-subscription"
              >
                {getSubscriptionLabel(user.subscriptionTier)}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowAvatarDialog(true)} data-testid="menu-change-avatar">
            <User className="mr-2 h-4 w-4" />
            <span>Change Avatar</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowAccountDialog(true)} data-testid="menu-account-settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation('/billing')} data-testid="menu-billing">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing & Plans</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} data-testid="menu-logout">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Avatar Selection Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Your Avatar</DialogTitle>
            <DialogDescription>
              Select a profile avatar that represents you best.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 py-4">
            {AVATAR_OPTIONS.map((avatar) => (
              <Button
                key={avatar.id}
                variant={selectedAvatar === avatar.id ? "default" : "outline"}
                className="h-20 w-20 p-1 flex flex-col items-center justify-center rounded-full overflow-hidden"
                onClick={() => handleAvatarSelect(avatar.id)}
                data-testid={`avatar-option-${avatar.id}`}
              >
                <img src={avatar.image} alt={avatar.label} className="w-full h-full object-cover rounded-full" />
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Account Settings Dialog */}
      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogDescription>
              Manage your account information and preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-muted-foreground">{getUserDisplayName()}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription</label>
              <Badge className={`w-fit ${getSubscriptionBadgeColor(user.subscriptionTier)}`}>
                {getSubscriptionLabel(user.subscriptionTier)}
              </Badge>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Contact support for account changes or billing questions.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}