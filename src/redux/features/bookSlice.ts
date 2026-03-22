import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BookingState {
  dentistId: string;
  dentistName: string;
}

const initialState: BookingState = {
  dentistId: "",
  dentistName: "",
};

export const bookSlice = createSlice({
  name: "book",
  initialState,
  reducers: {
    setBookingItem: (state, action: PayloadAction<BookingState>) => {
      state.dentistId = action.payload.dentistId;
      state.dentistName = action.payload.dentistName;
    },
    clearBookingItem: (state) => {
      state.dentistId = "";
      state.dentistName = "";
    },
  },
});

export const { setBookingItem, clearBookingItem } = bookSlice.actions;
export default bookSlice.reducer;