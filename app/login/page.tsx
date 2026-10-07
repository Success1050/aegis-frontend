"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  Shield,
  Lock,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = React.useState<number | null>(null);

  // Lockout countdown timer
  React.useEffect(() => {
    if (lockoutRemaining === null || lockoutRemaining <= 0) return;

    const timer = setInterval(() => {
      setLockoutRemaining((prev) => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { user, route } = await login(identifier, password);
      toast.success(
        `Welcome, ${user.name || user.fullName || "Operator"}. Redirecting to your command station.`,
        "Login Successful"
      );
      router.push(route);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid phone/email or password";
      setErrorMessage(msg);

      // Check if account lockout occurred
      if (msg.includes("locked") || msg.includes("Too many")) {
        setLockoutRemaining(300); // 5 min lockout indicator
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset loader for test accounts
  const handleQuickFill = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-950">
              <Shield className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            AEGIS COMMAND ACCESS
          </h1>
          <p className="text-xs text-slate-400">
            Automated Community Early-Warning Network • Nigeria
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-800 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-white">Sign In to Continue</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Enter your registered Nigerian phone number or official email address.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {/* Lockout Banner */}
            {lockoutRemaining !== null && lockoutRemaining > 0 && (
              <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-red-400" />
                <span>
                  Account temporarily locked. Please retry in {Math.floor(lockoutRemaining / 60)}:
                  {(lockoutRemaining % 60).toString().padStart(2, "0")}s.
                </span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && !lockoutRemaining && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Phone Number or Email"
                placeholder="+2348020000001 or officer@aegis.ng"
                required
                autoFocus
                leftIcon={<Phone className="w-4 h-4" />}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isLoading || (lockoutRemaining !== null && lockoutRemaining > 0)}
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  required
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="cursor-pointer hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || (lockoutRemaining !== null && lockoutRemaining > 0)}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold h-11 text-sm mt-2"
                isLoading={isLoading}
                disabled={lockoutRemaining !== null && lockoutRemaining > 0}
              >
                Access Command Station
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            {/* Demo & Test Account Presets */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Test Roles</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickFill("+2348020000001", "OfficerSecure2026!")}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 transition-colors cursor-pointer"
                >
                  <p className="font-semibold text-slate-200">Security Officer 1</p>
                  <p className="text-[10px] text-slate-400 font-mono">+2348020000001</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("+2348020000002", "OfficerSecure2026!")}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 transition-colors cursor-pointer"
                >
                  <p className="font-semibold text-slate-200">Security Officer 2</p>
                  <p className="text-[10px] text-slate-400 font-mono">+2348020000002</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("+2348000000001", "AdminSecure2026!")}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 transition-colors cursor-pointer"
                >
                  <p className="font-semibold text-purple-300">System Admin</p>
                  <p className="text-[10px] text-slate-400 font-mono">+2348000000001</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("+2348030000001", "ResidentSecure2026!")}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 transition-colors cursor-pointer"
                >
                  <p className="font-semibold text-slate-300">Resident</p>
                  <p className="text-[10px] text-slate-400 font-mono">+2348030000001</p>
                </button>
              </div>
            </div>

            {/* Note about credentials */}
            <p className="text-[11px] text-slate-500 text-center pt-2">
              Newly registered residents & officers receive login details via email/SMS.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
