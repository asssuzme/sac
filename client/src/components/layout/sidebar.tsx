import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Search,
  Briefcase,
  BarChart3,
  Settings,
  Sun,
  Moon,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    icon: Search,
    label: "Job Search",
    href: "/",
    description: "Find opportunities",
    badge: "New",
  },
  {
    icon: Briefcase,
    label: "Applications",
    href: "/applications",
    description: "Track progress",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/analytics",
    description: "Insights & metrics",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
    description: "Preferences",
  },
];

interface SidebarProps {
  user?: any;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ user, onLogout, isOpen = false, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use props if provided, otherwise use internal state
  const isSidebarOpen = isOpen !== undefined ? isOpen : internalOpen;
  const handleClose = onClose || (() => setInternalOpen(false));

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: isSidebarOpen || window.innerWidth >= 768 ? 0 : -320 }}
        transition={{ type: "spring", damping: 20 }}
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-card border-r z-50",
          "flex flex-col",
          "md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border/10">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Minimal text logo */}
            <h1 className="text-xl font-light tracking-wide">
              <span className="text-black dark:text-white">ai-jobhunter</span>
              <span className="text-blue-600 dark:text-blue-500">.com</span>
            </h1>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => {
              const isActive = location === item.href;
              return (
                <motion.li 
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <Link 
                    href={item.href}
                    className={cn(
                      "sidebar-item group",
                      isActive && "sidebar-item-active"
                    )}
                    onClick={handleClose}
                  >
                    <div className="relative">
                      <item.icon className="h-5 w-5 transition-all duration-200" />
                      {/* Active indicator dot */}
                      {isActive && (
                        <motion.div
                          className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-full"
                          layoutId="active-indicator"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="block text-sm font-medium">{item.label}</span>
                        {item.description && (
                          <span className={cn(
                            "block text-xs",
                            isActive ? "opacity-90" : "opacity-60"
                          )}>{item.description}</span>
                        )}
                      </div>
                      {item.badge && (
                        <motion.span 
                          className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t space-y-4">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <>
                <Moon className="h-4 w-4 mr-2" />
                Dark mode
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Light mode
              </>
            )}
          </Button>

          {/* User info */}
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.firstName || "User"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user.firstName?.[0] || user.email?.[0] || "U"}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Logout button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.aside>
    </>
  );
}