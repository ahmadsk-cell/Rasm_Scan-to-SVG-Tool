"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Layers, ScanLine } from "lucide-react";
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
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <section className="relative hidden overflow-hidden border-r border-border bg-card lg:flex">
        <div className="absolute inset-0 grid-dots opacity-60" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <BrandLogo size={52} withWordmark wordmarkClassName="[&_p:first-child]:text-xl" />
          </div>

          <div className="max-w-lg space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-5xl font-semibold leading-[1.05] tracking-tight"
            >
              Trace any image into precise SVG layers.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Turn photos, sketches, logos, and icons into editable vector paths for design, print,
              and production.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid gap-3"
            >
              {[
                { icon: ScanLine, text: "Geometry + detail extraction modes" },
                { icon: Layers, text: "Layered exports for design & CAD" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 rounded-md border border-border bg-background/60 px-4 py-3"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <BuiltBy showLogo />
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2 lg:hidden">
            <BrandLogo size={36} withWordmark />
          </div>

          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h2>
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
