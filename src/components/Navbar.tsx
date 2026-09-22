import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/directory", label: "Directory" },
  { to: "/add-new", label: "Add Entry" },
] as const;

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="gradient-accent flex size-9 items-center justify-center rounded-xl text-accent-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">EduTrack Hub</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-secondary [&.active]:text-foreground"
              activeOptions={{ exact: link.to === "/" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                  {(user.email ?? "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground lg:inline">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await signOut();
                  toast.success("Signed out");
                  navigate({ to: "/auth" });
                }}
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link to="/auth">Login / Register</Link>
            </Button>
          )}
        </div>
      </nav>

      <div className="flex items-center gap-1 overflow-x-auto border-t border-border/70 px-4 py-2 md:hidden">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors [&.active]:bg-secondary [&.active]:text-foreground"
            activeOptions={{ exact: link.to === "/" }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
