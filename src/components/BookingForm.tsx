import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import createBooking from "../libs/createBooking";

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
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    date: null as Dayjs | null,
    startTime: null as Dayjs | null,
    endTime: null as Dayjs | null,
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

      if (!formData.date || !formData.startTime || !formData.endTime) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      await createBooking(token, {
        dentistId,
        date: formData.date?.format("YYYY-MM-DD"),
        startTime: formData.startTime?.format("HH:mm"),
        endTime: formData.endTime?.format("HH:mm"),
        notes: formData.notes,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Appointment Date *
            </label>
            <DatePicker
              value={formData.date}
              onChange={(newDate) =>
                setFormData((prev) => ({
                  ...prev,
                  date: newDate,
                }))
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Start Time *
            </label>
            <TimePicker
              value={formData.startTime}
              onChange={(newTime) =>
                setFormData((prev) => ({
                  ...prev,
                  startTime: newTime,
                }))
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              End Time *
            </label>
            <TimePicker
              value={formData.endTime}
              onChange={(newTime) =>
                setFormData((prev) => ({
                  ...prev,
                  endTime: newTime,
                }))
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
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
            disabled={loading}
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
    </LocalizationProvider>
  );
}
