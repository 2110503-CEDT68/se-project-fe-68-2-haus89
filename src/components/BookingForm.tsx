import React, { useState, useEffect } from "react";
import { Button, CircularProgress } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
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
  const [filterDate, setFilterDate] = useState<Dayjs | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const token = localStorage.getItem("token") || undefined;
        const availableSlots = await getDentistAvailability(dentistId, token);
        const now = dayjs();
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
  const displayedDates = filterDate
    ? sortedDates.filter((d) => d === filterDate.format("YYYY-MM-DD"))
    : sortedDates;

  const availableDateSet = new Set(sortedDates);

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
            <>
              {/* Date Filter Calendar */}
              <div className="mb-6 pl-2">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div className="flex items-center gap-4">
                    <DatePicker
                      label="Filter by date"
                      value={filterDate}
                      onChange={(newDate) => setFilterDate(newDate)}
                      shouldDisableDate={(date) =>
                        !availableDateSet.has(date.format("YYYY-MM-DD"))
                      }
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: { maxWidth: 220 },
                        },
                      }}
                    />
                    {filterDate && (
                      <button
                        type="button"
                        onClick={() => setFilterDate(null)}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        Show all
                      </button>
                    )}
                  </div>
                </LocalizationProvider>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-5 pr-2 pl-2 custom-scrollbar">
                {displayedDates.map((dateKey) => (
                  <div key={dateKey}>
                    <p className="text-sm font-semibold text-gray-700 mb-3 sticky top-0 bg-white py-2 z-10 border-b border-gray-100">
                       {dayjs(dateKey).format("dddd, MMMM D, YYYY")}
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
                            className={`px-4 py-3 rounded-xl border-2 text-center transition-all duration-200 ${
                              isSelected
                                ? "border-blue-600 bg-blue-50 text-blue-800 shadow-sm"
                                : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm"
                            }`}
                          >
                            <span className="text-[15px] font-semibold flex items-center justify-center gap-2">
                               {slot.startTime} - {slot.endTime}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
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
