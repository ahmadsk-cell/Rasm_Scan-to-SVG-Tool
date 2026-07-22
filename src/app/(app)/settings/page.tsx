"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BuiltBy } from "@/components/layout/built-by";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Workspace preferences and account details for your organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Organization identity and access role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Organization</p>
              <p className="font-medium">{user?.organization}</p>
            </div>
            <Badge variant="success">{user?.role}</Badge>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Dark mode is the default for studio workflows.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm">Theme</p>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Credits and project links for Rasm.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <BrandLogo size={56} withWordmark wordmarkClassName="[&_p:first-child]:text-lg" />
          <p className="text-sm text-muted-foreground">
            Rasm turns everyday images — logos, sketches, photos, icons — into editable SVG
            vector layers. Built by ASK Andalus.
          </p>
          <BuiltBy showLogo />
          <Button asChild variant="outline" size="sm">
            <Link
              href="https://github.com/ahmadsk-cell"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Production hooks for Clerk/NextAuth SSO and Python CV microservices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Auth adapter: replace demo sign-in with Clerk or NextAuth organization management.
          </p>
          <p>
            Vector engine: point{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              VECTOR_SERVICE_URL
            </code>{" "}
            at your OpenCV/Potrace microservice for live contour tracing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
