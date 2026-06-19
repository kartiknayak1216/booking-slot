"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatInTimezone } from "@/lib/timezone";

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export default function ProviderPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const fetchMySlots = useCallback(async () => {
    if (!user) return;
    const res = await fetch(`/api/slots?providerId=${user.id}&page=1`);
    const data = await res.json();
    const res2 = await fetch(`/api/provider/slots`);
    if (res2.ok) {
      const data2 = await res2.json();
      setSlots(data2.slots || []);
    } else {
      setSlots(data.slots || []);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user && user.role !== "PROVIDER") router.push("/slots");
  }, [user, loading, router]);

  useEffect(() => { fetchMySlots(); }, [fetchMySlots]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage("");

    const res = await fetch("/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime, endTime }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Slot created!");
      setStartTime("");
      setEndTime("");
      fetchMySlots();
    } else {
      setMessage(data.error || "Failed to create slot");
    }
    setCreating(false);
  };

  if (loading) return null;

  return (
    <div>
      <h1 className="page-title mb-6">Manage Your Slots</h1>

      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-foreground mb-4">Add a New Slot</h2>
        <form onSubmit={create} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-muted mb-1">Start Time</label>
            <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)}
              className="input-field text-sm w-auto" required />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">End Time</label>
            <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)}
              className="input-field text-sm w-auto" required />
          </div>
          <button type="submit" disabled={creating} className="btn-primary px-4 py-2 text-sm">
            {creating ? "Creating..." : "Create Slot"}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${message.includes("created") ? "text-emerald-600" : "text-red-500"}`}>
            {message}
          </p>
        )}
      </div>

      <h2 className="font-semibold text-foreground mb-3">Your Slots</h2>
      {slots.length === 0 ? (
        <p className="text-muted text-sm">No slots yet. Create one above.</p>
      ) : (
        <div className="space-y-2">
          {slots.map((slot) => (
            <div key={slot.id} className="card px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-foreground">
                {user && formatInTimezone(slot.startTime, user.timezone)}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                slot.isBooked ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              }`}>
                {slot.isBooked ? "Booked" : "Available"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
