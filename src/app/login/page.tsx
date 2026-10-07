"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BuiltBy } from "@/components/layout/built-by";
import { BrandLogo } from "@/components/layout/brand-logo";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, signIn } = useAuthStore();
  const [email, setEmail] = useState("ava@studio.example");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    signIn(email);
    router.push("/dashboard");
  }

  return (
    <div className="relative grid min-h-screen bg-background lg:grid-cols-[1.1fr_0.9fr]">
      <div className="absolute right-3 top-3 z-20">
        <ThemeToggle />
      </div>

      <section className="relative hidden flex-col justify-between bg-stage p-10 lg:flex">
        <BrandLogo size={36} withWordmark />
        <div className="max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-medium leading-tight tracking-tight text-foreground"
          >
            Trace an image into editable paths.
          </motion.h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Layers, compare, and export. The picture stays in the center.
          </p>
        </div>
        <BuiltBy showLogo />
      </section>

      <section className="flex items-center justify-center bg-card p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2 lg:hidden">
            <BrandLogo size={36} withWordmark />
          </div>

          <div>
            <h2 className="font-display text-2xl font-medium tracking-tight">Sign in</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your image-to-vector workspace.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="rasm-demo" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Continue to workspace"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <BuiltBy align="center" showLogo />
        </motion.div>
      </section>
    </div>
  );
}
