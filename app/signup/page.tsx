"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER", timezone: "UTC" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Signup failed");
      setLoading(false);
      return;
    }

    await refresh();
    router.push("/slots");
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="card p-6">
        <h1 className="page-title mb-6">Create an account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">I am a...</label>
            <select name="role" value={form.role} onChange={handleChange} className="input-field">
              <option value="USER">User (book appointments)</option>
              <option value="PROVIDER">Provider (offer time slots)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Your Timezone</label>
            <select name="timezone" value={form.timezone} onChange={handleChange} className="input-field">
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          {error && <p className="alert-error">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-2">
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-sm text-muted text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
