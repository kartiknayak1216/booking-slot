"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatInTimezone } from "@/lib/timezone";

interface Booking {
  id: string;
  status: string;
  createdAt: string;
  slot: {
    id: string;
    startTime: string;
    endTime: string;
    provider: { name: string; timezone: string };
  };
}

export default function MyBookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{ id: string; startTime: string; provider: { name: string; timezone: string } }[]>([]);

  const fetchBookings = useCallback(async () => {
    setFetching(true);
    const res = await fetch("/api/bookings");
    const data = await res.json();
    setBookings(data.bookings || []);
    setFetching(false);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const cancel = async (bookingId: string) => {
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
    if (res.ok) {
      setMessage("Booking cancelled.");
      fetchBookings();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to cancel");
    }
  };

  const startReschedule = async (bookingId: string) => {
    setReschedulingId(bookingId);
    const res = await fetch("/api/slots");
    const data = await res.json();
    setAvailableSlots(data.slots || []);
  };

  const reschedule = async (bookingId: string, newSlotId: string) => {
    const res = await fetch(`/api/bookings/${bookingId}/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newSlotId }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Rescheduled successfully!");
      setReschedulingId(null);
      fetchBookings();
    } else {
      setMessage(data.error || "Reschedule failed");
    }
  };

  if (loading) return <p className="text-center mt-20 text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="page-title mb-6">My Bookings</h1>

      {message && (
        <div className={`mb-4 ${message.includes("success") || message.includes("cancel") ? "alert-success" : "alert-error"}`}>
          {message}
        </div>
      )}

      {fetching ? (
        <p className="text-center py-10 text-muted">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-center py-10 text-muted">No bookings yet. <a href="/slots" className="text-primary hover:underline">Browse slots</a></p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{booking.slot.provider.name}</p>
                  <p className="text-sm text-muted mt-0.5">
                    Provider: {formatInTimezone(booking.slot.startTime, booking.slot.provider.timezone)} ({booking.slot.provider.timezone})
                  </p>
                  {user && user.timezone !== booking.slot.provider.timezone && (
                    <p className="text-sm text-primary mt-0.5">
                      Your time: {formatInTimezone(booking.slot.startTime, user.timezone)} ({user.timezone})
                    </p>
                  )}
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                    booking.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-muted"
                  }`}>
                    {booking.status}
                  </span>
                </div>
                {booking.status === "ACTIVE" && (
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => startReschedule(booking.id)} className="btn-secondary text-sm px-3 py-1.5">
                      Reschedule
                    </button>
                    <button onClick={() => cancel(booking.id)}
                      className="text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {reschedulingId === booking.id && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground mb-2">Pick a new slot:</p>
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-muted">No available slots right now.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between bg-accent-soft px-3 py-2 rounded-md">
                          <span className="text-sm text-foreground">
                            {user ? formatInTimezone(slot.startTime, user.timezone) : slot.startTime}
                          </span>
                          <button onClick={() => reschedule(booking.id, slot.id)}
                            className="btn-primary text-xs px-2 py-1">
                            Pick
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setReschedulingId(null)}
                    className="mt-2 text-sm text-muted hover:text-foreground transition-colors">Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
