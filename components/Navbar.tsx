"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="bg-surface border-b border-border px-4 py-3 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">SlotBook</Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/slots" className="text-muted hover:text-primary transition-colors">Browse Slots</Link>
              <Link href="/my-bookings" className="text-muted hover:text-primary transition-colors">My Bookings</Link>
              {user.role === "PROVIDER" && (
                <Link href="/provider" className="text-muted hover:text-primary transition-colors">Manage Slots</Link>
              )}
              <span className="text-border">|</span>
              <span className="text-foreground font-medium">{user.name}</span>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-600 transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-primary transition-colors">Login</Link>
              <Link href="/signup" className="btn-primary px-3 py-1.5 text-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
