
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, FileText, CheckSquare, List, Settings, LogOut, Monitor, Users, CreditCard } from 'lucide-react';
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Service Catalog",
    url: "/service-catalog",
    icon: List,
    items: [
      { title: "Asset Request", url: "/asset-request" },
      { title: "Surat Permintaan Barang", url: "/goods-request" },
      { title: "IT Support", url: "/it-support" },
      { title: "Travel Request", url: "/travel-request" },
    ]
  },
  {
    title: "My Tickets",
    url: "/my-tickets",
    icon: FileText,
  },
  {
    title: "Task List",
    url: "/task-list",
    icon: CheckSquare,
    badge: "3"
  },
];

const adminItems = [
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "System Config",
    url: "/admin/config",
    icon: Settings,
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HOTS</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">HOTS</h3>
            <p className="text-sm text-gray-500">Helpdesk System</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <a href={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-50 hover:text-blue-700">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <a href={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 hover:text-gray-700">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Yosua Gultom</p>
            <p className="text-xs text-gray-500 truncate">International Operation</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full justify-start">
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex items-center space-x-3">
                  <img src="/lovable-uploads/8053d08a-8b10-4050-a1e7-713b251adcdb.png" alt="Indofood CBP" className="h-8" />
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">PT INDOFOOD CBP SUKSES MAKMUR</h1>
                    <p className="text-sm text-gray-500">Divisi Noodle</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <List className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
