"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="text-center py-20">
      <div className="inline-block bg-accent-soft text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
        Simple appointment booking
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-4">Book appointments, effortlessly.</h1>
      <p className="text-muted mb-8 text-lg max-w-md mx-auto">Providers set slots. Users book them. Simple.</p>
      {user ? (
        <div className="flex justify-center gap-4">
          <Link href="/slots" className="btn-primary px-6 py-3">Browse Slots</Link>
          <Link href="/my-bookings" className="btn-secondary px-6 py-3">My Bookings</Link>
        </div>
      ) : (
        <div className="flex justify-center gap-4">
          <Link href="/signup" className="btn-primary px-6 py-3">Get Started</Link>
          <Link href="/login" className="btn-secondary px-6 py-3">Log In</Link>
        </div>
      )}
    </div>
  );
}
