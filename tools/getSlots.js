// import { fetchSlots } from "../services/healthcareApi.js";
// import { getSlotsSchema } from "../schemas/toolSchemas.js";

// export function getSlotsTool(server) {
//   server.tool(
//     "get_slots",
//     getSlotsSchema,
//     async ({ start_datetime, end_datetime }) => {
//       const data = await fetchSlots(start_datetime, end_datetime);

//       const slots =
//         data.entry?.map((slot) => ({
//           id: slot.resource?.id,
//           start: slot.resource?.start,
//           end: slot.resource?.end,
//           status: slot.resource?.status
//         })) || [];

//       return {
//         content: slots
//       };
//     }
//   );
// }


import { fetchSlots } from "../services/healthcareApi.js";

export async function getSlots(input = {}) {
  try {
    const {
      start_datetime,
      end_datetime
    } = input;

    if (!start_datetime) {
      throw new Error("start_datetime is required");
    }

    if (!end_datetime) {
      throw new Error("end_datetime is required");
    }

    const data = await fetchSlots(
      start_datetime,
      end_datetime
    );

    const slots =
      data?.entry?.map((entry) => ({
        slot_id: entry.resource?.id,
        start: entry.resource?.start,
        end: entry.resource?.end,
        status: entry.resource?.status
      })) || [];

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "success",
              count: slots.length,
              slots
            },
            null,
            2
          )
        }
      ]
    };
  } catch (error) {
    console.error("get_slots failed");
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
      ],
      isError: true
    };
  }
}
