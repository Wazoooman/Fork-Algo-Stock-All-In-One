"use client"
import { BarChart3, BookOpen, Home, Newspaper, Settings, TrendingUp } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type ActiveTab = "dashboard" | "screener" | "journal" | "news" | "settings"

interface AppSidebarProps {
  activeTab: ActiveTab
  onNavigate: (tab: ActiveTab) => void
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: Home,
      key: "dashboard" as ActiveTab,
    },
    {
      title: "Stock Screener",
      url: "#",
      icon: TrendingUp,
      key: "screener" as ActiveTab,
    },
    {
      title: "Trade Journal",
      url: "#",
      icon: BookOpen,
      key: "journal" as ActiveTab,
    },
    {
      title: "Market News",
      url: "#",
      icon: Newspaper,
      key: "news" as ActiveTab,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      key: "settings" as ActiveTab,
    },
  ],
}

export function AppSidebar({ activeTab, onNavigate }: AppSidebarProps) {
  return (
    <Sidebar className="bg-[#0b0f19] border-r border-gray-800">
      <SidebarHeader className="bg-[#0b0f19] border-b border-gray-800 p-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-400" />
          <span className="text-lg font-semibold text-gray-100">MarketDesk</span>
        </div>
        <SidebarTrigger className="fixed top-4 left-4 z-50 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-600 rounded-md p-2" />
      </SidebarHeader>
      <SidebarContent className="bg-[#0b0f19]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeTab === item.key}
                    className={`
                      text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 
                      ${
                        activeTab === item.key
                          ? "bg-gray-800/30 text-gray-100 font-medium border-l-2 border-blue-400"
                          : ""
                      }
                    `}
                  >
                    <button onClick={() => onNavigate(item.key)} className="w-full flex items-center gap-2 p-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-[#0b0f19] border-t border-gray-800 p-4">
        <div className="text-xs text-gray-400">© 2024 MarketDesk</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
