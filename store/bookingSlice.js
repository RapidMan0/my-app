import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  barbers: [],
  services: [],
  selectedBarber: null,
  selectedService: null,
  selectedDate: "",
  selectedTime: null,
  isOpen: false,
  showForm: false,
  showBookingButton: true,
  discount: {
    percent: 0,
    amount: 0,
    message: "",
  },
  finalPrice: 0,
  toast: {
    show: false,
    message: "",
    type: "success",
  },
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBarbers: (state, action) => {
      state.barbers = action.payload;
    },
    setServices: (state, action) => {
      state.services = action.payload;
    },
    setSelectedBarber: (state, action) => {
      state.selectedBarber = action.payload;
      if (!action.payload) {
        state.selectedService = null;
        state.selectedDate = "";
        state.selectedTime = null;
      }
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedTime: (state, action) => {
      state.selectedTime = action.payload;
    },
    setIsOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    setShowForm: (state, action) => {
      state.showForm = action.payload;
    },
    setShowBookingButton: (state, action) => {
      state.showBookingButton = action.payload;
    },
    setDiscount: (state, action) => {
      state.discount = action.payload;
    },
    setFinalPrice: (state, action) => {
      state.finalPrice = action.payload;
    },
    setToast: (state, action) => {
      state.toast = action.payload;
    },
    resetBooking: (state) => {
      state.selectedBarber = null;
      state.selectedService = null;
      state.selectedDate = "";
      state.selectedTime = null;
      state.showForm = false;
      state.discount = {
        percent: 0,
        amount: 0,
        message: "",
      };
      state.finalPrice = 0;
    },
  },
});

export const {
  setBarbers,
  setServices,
  setSelectedBarber,
  setSelectedService,
  setSelectedDate,
  setSelectedTime,
  setIsOpen,
  setShowForm,
  setShowBookingButton,
  setDiscount,
  setFinalPrice,
  setToast,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
