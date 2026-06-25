import "../App.scss";
import "../globals.css";
import SidePanel from "@/components/SidePanel";
import { SidebarProvider } from "@/components/SidePanel";
import MainContent from "@/components/MainContent";

export const metadata = {
  title: "MindMate",
  description: "AI Powered Therapy",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <SidePanel />
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
}
