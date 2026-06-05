"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Menu, X, LogOut, Shield, LayoutDashboard, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { isAdmin as isAdminRole } from "@/lib/auth";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Directory" },
    { href: "/universities", label: "Universities" },
    { href: "/timtim", label: "TimTim" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-accent to-rose-900 flex items-center justify-center font-serif font-bold text-black">
            G
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-tight">Gonix</p>
            <p className="text-[10px] text-fg-dim uppercase tracking-widest">Verified Academic Network</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                pathname === l.href ? "text-fg bg-fg/5" : "text-fg-muted hover:text-fg hover:bg-fg/5"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {status === "loading" ? (
            <div className="h-8 w-24 rounded-md bg-fg/5 animate-pulse" />
          ) : session?.user ? (
            <UserMenu />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden h-9 w-9 rounded-md hover:bg-fg/5 flex items-center justify-center"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-line bg-bg-soft px-4 py-4 space-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-md text-sm hover:bg-fg/5"
            >
              {l.label}
            </Link>
          ))}
          {session?.user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm hover:bg-fg/5">
                Dashboard
              </Link>
              {isAdminRole((session.user as any).role) ? (
                <Link href="/admin" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm hover:bg-fg/5">
                  Admin
                </Link>
              ) : null}
              <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-fg/5 text-danger">
                Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Sign in</Button>
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="flex-1">
                <Button variant="primary" size="sm" className="w-full">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
}

function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  if (!session?.user) return null;
  const role = (session.user as any).role as string;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-fg/5"
      >
        <Avatar name={session.user.name || "U"} size="sm" />
        <span className="text-sm hidden sm:block">{session.user.name?.split(" ")[0]}</span>
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 rounded-md border border-line bg-bg-soft shadow-soft z-40 py-1.5">
            <div className="px-3 py-2 border-b border-line">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-fg-muted truncate">{session.user.email}</p>
            </div>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-fg/5">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link href={`/u/${(session.user as any).handle}`} onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-fg/5">
              <UserIcon className="h-4 w-4" /> My profile
            </Link>
            {isAdminRole(role) ? (
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-fg/5">
                <Shield className="h-4 w-4" /> Admin
              </Link>
            ) : null}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-fg/5 text-danger"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
