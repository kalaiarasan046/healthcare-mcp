// import { createAppointment } from "../services/healthcareApi.js";
// import { bookAppointmentSchema } from "../schemas/toolSchemas.js";

// export function bookAppointmentTool(server) {
//   server.tool(
//     "book_appointment",
//     bookAppointmentSchema,
//     async (input) => {
//       const payload = {
//         resourceType: "Appointment",
//         status: "booked",
//         description: `${input.specialty} consultation with ${input.doctor_name}`,
//         TimeSlot: input.selected_time_slot,
//         participant: [
//           { status: "accepted" },
//           { status: "accepted" }
//         ]
//       };

//       const data = await createAppointment(payload);

//       return {
//         content: {
//           appointment_id: data.id,
//           status: data.status,
//           doctor: input.doctor_name,
//           time: input.selected_time_slot
//         }
//       };
//     }
//   );
// }



import { createAppointment } from "../services/healthcareApi.js";

export async function bookAppointment(input) {
  try {
    const {
      specialty,
      doctor_name,
      selected_time_slot
    } = input;

    // Basic validation
    if (!specialty) {
      throw new Error("specialty is required");
    }

    if (!doctor_name) {
      throw new Error("doctor_name is required");
    }

    if (!selected_time_slot) {
      throw new Error("selected_time_slot is required");
    }

    const payload = {
      resourceType: "Appointment",
      status: "booked",
      description: `${specialty} consultation with ${doctor_name}`,
      TimeSlot: selected_time_slot,
      participant: [
        {
          status: "accepted"
        },
        {
          status: "accepted"
        }
      ]
    };

    const data = await createAppointment(payload);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "success",
              appointment_id: data?.id ?? null,
              doctor: doctor_name,
              specialty,
              selected_time_slot,
              appointment_status: data?.status ?? "booked"
            },
            null,
            2
          )
        }
      ]
    };
  } catch (error) {
    console.error("book_appointment failed");
    console.error(error);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "error",
              message: error.message
            },
            null,
            2
          )
        }
      ]
    };
  }
}