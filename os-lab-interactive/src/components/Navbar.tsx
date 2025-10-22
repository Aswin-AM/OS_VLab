
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Code2, BookOpen, TrendingUp, Bug, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Code2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">OS VLab</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/">
            <Button variant={isActive("/") ? "default" : "ghost"} size="sm">
              Home
            </Button>
          </Link>
          <Link to="/topics">
            <Button variant={isActive("/topics") ? "default" : "ghost"} size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              Topics
            </Button>
          </Link>
          <Link to="/docs">
            <Button variant={isActive("/docs") ? "default" : "ghost"} size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              Docs
            </Button>
          </Link>
          <Link to="/progress">
            <Button variant={isActive("/progress") ? "default" : "ghost"} size="sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              Progress
            </Button>
          </Link>
          <Link to="/report-bug">
            <Button variant="outline" size="sm">
              <Bug className="mr-2 h-4 w-4" />
              Report Bug
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  {user.displayName || user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
