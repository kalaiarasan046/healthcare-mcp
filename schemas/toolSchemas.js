import { z } from "zod";

// 1. Doctors
export const getDoctorsSchema = {
  specialty: z.string().min(2)
};

// 2. Slots
export const getSlotsSchema = {
  start_datetime: z.string(),
  end_datetime: z.string()
};

// 3. Appointment
export const bookAppointmentSchema = {
  specialty: z.string(),
  doctor_name: z.string(),
  selected_time_slot: z.string()
};