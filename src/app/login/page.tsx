"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, VectorSquare, Workflow } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, signIn } = useAuthStore();
  const [email, setEmail] = useState("ava@acme-footwear.com");
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

      <section className="relative hidden overflow-hidden border-r border-border lg:flex">
        <div className="absolute inset-0 grid-dots" />
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 via-transparent to-cyan-500/10" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/40">
              <VectorSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold">VectorPath AI</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Enterprise Studio
              </p>
            </div>
          </div>

          <div className="max-w-lg space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-5xl font-semibold leading-[1.05] tracking-tight"
            >
              Precision vectors from every cleat scan.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Isolate silhouettes, brand marks, and panel breaks into editable SVG layers ready for
              manufacturing and game pipelines.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid gap-3"
            >
              {[
                { icon: Workflow, text: "Geometry + detail extraction modes" },
                { icon: ShieldCheck, text: "Workspace-ready for enterprise teams" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/50 px-4 py-3 backdrop-blur"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <p className="text-xs text-muted-foreground">
            Demo auth — swap in Clerk or NextAuth for production SSO.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2 lg:hidden">
            <div className="flex items-center gap-2 text-primary">
              <VectorSquare className="h-5 w-5" />
              <span className="font-display text-lg font-semibold text-foreground">VectorPath AI</span>
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your footwear vectorization workspace.
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
              <Input id="password" type="password" defaultValue="vectorpath-demo" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Continue to workspace"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to enterprise workspace policies.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
