import { AuthGuard } from "@/components/layout/auth-guard";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
          <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
          <MobileNav />
        </div>
      </div>
    </AuthGuard>
  );
}
