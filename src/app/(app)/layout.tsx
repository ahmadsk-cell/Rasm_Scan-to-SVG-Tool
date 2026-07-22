import { AuthGuard } from "@/components/layout/auth-guard";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BuiltBy } from "@/components/layout/built-by";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex min-h-screen flex-1 flex-col pb-20 md:pb-0">
          <main className="flex-1">{children}</main>
          <footer className="hidden border-t border-border px-6 py-3 md:block">
            <BuiltBy showLogo />
          </footer>
          <MobileNav />
        </div>
      </div>
    </AuthGuard>
  );
}
