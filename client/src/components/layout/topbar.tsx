import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title?: string;
  className?: string;
}

export function Topbar({ title = "Dashboard", className }: TopbarProps) {
  return (
    <header className={cn("sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b", className)}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Title */}
        <h2 className="text-2xl font-semibold">{title}</h2>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 w-64"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}