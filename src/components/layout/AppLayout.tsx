
import React, { useState } from 'react';
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
  SidebarInset,
} from "@/components/ui/sidebar";
import { Home, FileText, CheckSquare, List, Settings, LogOut, Monitor, Users, Search, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import ProfileModal from "@/components/modals/ProfileModal";

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
    title: "System Settings",
    url: "/admin/settings",
    icon: Settings,
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Division Management",
    url: "/admin/divisions",
    icon: Monitor,
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-xs">HOTS</span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h3 className="font-semibold text-sidebar-foreground">HOTS</h3>
            <p className="text-sm text-sidebar-foreground/70">Helpdesk System</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider px-3 py-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link 
                      to={item.url} 
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 hover:text-primary",
                        location.pathname === item.url && "bg-primary/10 text-primary"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5 group-data-[collapsible=icon]:hidden">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider px-3 py-2">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link 
                      to={item.url} 
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        location.pathname === item.url && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center space-x-3 mb-3 group-data-[collapsible=icon]:justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 bg-muted rounded-full group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
            onClick={() => setIsProfileModalOpen(true)}
          >
            <User className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Yosua Gultom</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">International Operation</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:px-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 group-data-[collapsible=icon]:mr-0 mr-2" />
          <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
        </Button>
        
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppLayout({ children, searchValue, onSearchChange, searchPlaceholder = "Search..." }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-40 bg-foreground border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="text-background hover:bg-background/10" />
                <div className="flex items-center space-x-3">
                  <div>
                    <h1 className="text-lg font-semibold text-background">PT INDOFOOD CBP SUKSES MAKMUR</h1>
                    <p className="text-sm text-background/80">Divisi Noodle</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue || ''}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="w-64 pl-4 pr-10 py-2 bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-foreground focus-visible:ring-2 focus-visible:border-foreground"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
