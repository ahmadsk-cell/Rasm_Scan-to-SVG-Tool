import { AuthGuard } from "@/components/layout/auth-guard";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex min-h-screen flex-1 flex-col pb-20 md:pb-0">
          <main className="flex-1">{children}</main>
          <MobileNav />
        </div>
      </div>
    </AuthGuard>
  );
}
