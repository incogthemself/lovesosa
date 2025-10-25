import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface LoginModalProps {
  isOpen: boolean;
  onSubmit: (credentials: { usernameOrEmail: string; password: string }) => void;
  appName?: string;
}

export function LoginModal({ isOpen, onSubmit, appName = "Profile Platform" }: LoginModalProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ usernameOrEmail, password });
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="max-w-md border-0 bg-card/95 backdrop-blur-xl shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        data-testid="dialog-login"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center mb-2" data-testid="text-login-title">
            Sign in with {appName} to access
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username-email" className="text-sm font-medium">
              Username or Email
            </Label>
            <Input
              id="username-email"
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Enter your username or email"
              className="h-12 bg-background/50 border-border focus:ring-2 focus:ring-primary"
              required
              data-testid="input-username-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-12 bg-background/50 border-border focus:ring-2 focus:ring-primary"
              required
              data-testid="input-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
            data-testid="button-sign-in"
          >
            Sign In
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
