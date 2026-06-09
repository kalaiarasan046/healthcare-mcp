// import { fetchDoctors } from "../services/healthcareApi.js";
// import { getDoctorsSchema } from "../schemas/toolSchemas.js";

// export function getDoctorsTool(server) {
//   server.tool(
//     "get_doctors",
//     getDoctorsSchema,
//     async ({ specialty }) => {
//       const data = await fetchDoctors(specialty);

//       const doctors =
//         data.results?.map((doc) => ({
//           name: doc.basic?.first_name + " " + doc.basic?.last_name,
//           specialty: specialty,
//           npi: doc.number
//         })) || [];

//       return {
//         content: doctors
//       };
//     }
//   );
// }


import { fetchDoctors } from "../services/healthcareApi.js";

export async function getDoctors(input) {
  try {
    const { specialty } = input;

    if (!specialty) {
      throw new Error("specialty is required");
    }

    const data = await fetchDoctors(specialty);

    const doctors =
      data?.results?.map((doctor) => ({
        npi: doctor.number,
        name: [
          doctor.basic?.first_name,
          doctor.basic?.last_name
        ]
          .filter(Boolean)
          .join(" "),
        specialty
      })) || [];

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "success",
              count: doctors.length,
              doctors
            },
            null,
            2
          )
        }
      ]
    };
  } catch (error) {
    console.error("get_doctors failed");
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