import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BookingState {
  dentistId: string;
  dentistName: string;
  bookingId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}

const initialState: BookingState = {
  dentistId: "",
  dentistName: "",
  bookingId: "",
  date: "",
  startTime: "",
  endTime: "",
  status: "",
};

export const bookSlice = createSlice({
  name: "book",
  initialState,
  reducers: {
    setBookingItem: (state, action: PayloadAction<BookingState>) => {
      state.dentistId = action.payload.dentistId;
      state.dentistName = action.payload.dentistName;
      state.bookingId = action.payload.bookingId;
      state.date = action.payload.date;
      state.startTime = action.payload.startTime;
      state.endTime = action.payload.endTime;
      state.status = action.payload.status;
    },
    setBookingDetails: (state, action: PayloadAction<Partial<BookingState>>) => {
      Object.assign(state, action.payload);
    },
    clearBookingItem: (state) => {
      state.dentistId = "";
      state.dentistName = "";
      state.bookingId = "";
      state.date = "";
      state.startTime = "";
      state.endTime = "";
      state.status = "";
    },
  },
});

export const { setBookingItem, setBookingDetails, clearBookingItem } = bookSlice.actions;
export default bookSlice.reducer;