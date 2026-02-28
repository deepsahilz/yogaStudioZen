import { AuthProvider } from "@/components/auth-provider";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <main className="lg:pl-64">
          <div className="px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
