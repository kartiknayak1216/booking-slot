"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatInTimezone } from "@/lib/timezone";

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  provider: { id: string; name: string; timezone: string };
}

export default function SlotsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [date, setDate] = useState("");
  const [fetching, setFetching] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const fetchSlots = useCallback(async () => {
    setFetching(true);
    const params = new URLSearchParams({ page: String(page) });
    if (date) params.set("date", date);
    const res = await fetch(`/api/slots?${params}`);
    const data = await res.json();
    setSlots(data.slots || []);
    setPages(data.pages || 1);
    setFetching(false);
  }, [page, date]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const book = async (slotId: string) => {
    setBookingId(slotId);
    setMessage("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Booked successfully!");
      fetchSlots();
    } else {
      setMessage(data.error || "Booking failed");
    }
    setBookingId(null);
  };

  if (loading) return <p className="text-center mt-20 text-muted">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Available Slots</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted">Filter by date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="input-field w-auto py-1.5 text-sm"
          />
          {date && (
            <button onClick={() => { setDate(""); setPage(1); }}
              className="text-sm text-muted hover:text-foreground transition-colors">Clear</button>
          )}
        </div>
      </div>

      {message && (
        <div className={`mb-4 ${message.includes("success") ? "alert-success" : "alert-error"}`}>
          {message}
        </div>
      )}

      {fetching ? (
        <p className="text-center py-10 text-muted">Loading slots...</p>
      ) : slots.length === 0 ? (
        <p className="text-center py-10 text-muted">No available slots{date ? " on this date" : ""}.</p>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => (
            <div key={slot.id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Dr. {slot.provider.name}</p>
                <p className="text-sm text-muted mt-0.5">
                  Provider: {formatInTimezone(slot.startTime, slot.provider.timezone)} ({slot.provider.timezone})
                </p>
                {user && user.timezone !== slot.provider.timezone && (
                  <p className="text-sm text-primary mt-0.5">
                    Your time: {formatInTimezone(slot.startTime, user.timezone)} ({user.timezone})
                  </p>
                )}
              </div>
              <button
                onClick={() => book(slot.id)}
                disabled={bookingId === slot.id}
                className="btn-primary px-4 py-2 text-sm"
              >
                {bookingId === slot.id ? "Booking..." : "Book"}
              </button>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">← Prev</button>
          <span className="px-3 py-1.5 text-sm text-muted">{page} / {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
