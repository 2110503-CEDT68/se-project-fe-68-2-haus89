import React, { useState, useEffect } from "react";
import { Button, CircularProgress } from "@mui/material";
import dayjs from "dayjs";
import createBooking from "../libs/createBooking";
import getDentistAvailability, {
  AvailableSlot,
} from "../libs/getDentistAvailability";

interface BookingFormProps {
  dentistId: string;
  dentistName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BookingForm({
  dentistId,
  dentistName,
  onSuccess,
  onCancel,
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const token = localStorage.getItem("token") || undefined;
        const availableSlots = await getDentistAvailability(dentistId, token);
        const now = dayjs();
        // Filter out booked slots and past slots
        setSlots(
          availableSlots.filter(
            (slot) => !slot.isBooked && dayjs(slot.date).isAfter(now, "day")
          )
        );
      } catch (err: any) {
        setError(err.message || "Failed to load available slots");
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [dentistId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      if (!selectedSlot) {
        setError("Please select an available time slot");
        setLoading(false);
        return;
      }

      await createBooking(token, {
        dentistId,
        date: dayjs(selectedSlot.date).format("YYYY-MM-DD"),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  // Group slots by date
  const groupedSlots = slots.reduce(
    (groups, slot) => {
      const dateKey = dayjs(slot.date).format("YYYY-MM-DD");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(slot);
      return groups;
    },
    {} as Record<string, AvailableSlot[]>
  );

  const sortedDates = Object.keys(groupedSlots).sort();

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Book with {dentistName}
      </h2>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Select Available Time Slot *
          </label>

          {slotsLoading ? (
            <div className="flex justify-center items-center py-10">
              <CircularProgress size={32} />
              <span className="ml-3 text-gray-500">Loading available slots...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500 font-medium">No available slots</p>
              <p className="text-gray-400 text-sm mt-1">
                This dentist has no open time slots at the moment.
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-4 pr-1 pl-4">
              {sortedDates.map((dateKey) => (
                <div key={dateKey}>
                  <p className="text-sm font-bold text-blue-800 mb-2 sticky top-0 bg-white py-1">
                    📅 {dayjs(dateKey).format("dddd, MMMM D, YYYY")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupedSlots[dateKey].map((slot, idx) => {
                      const isSelected =
                        selectedSlot &&
                        dayjs(selectedSlot.date).format("YYYY-MM-DD") === dateKey &&
                        selectedSlot.startTime === slot.startTime &&
                        selectedSlot.endTime === slot.endTime;

                      return (
                        <button
                          key={`${dateKey}-${idx}`}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200"
                              : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                        >
                          <span className="text-sm font-bold">
                            🕐 {slot.startTime} - {slot.endTime}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes..."
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading || !selectedSlot}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
