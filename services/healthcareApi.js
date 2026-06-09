// import axios from "axios";

// // 1. Get doctors from NPI registry
// export async function fetchDoctors(specialty) {
//   const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&taxonomy_description=${specialty}&enumeration_type=NPI-1&limit=6`;

//   const res = await axios.get(url);
//   return res.data;
// }

// // 2. Get available slots from FHIR
// export async function fetchSlots(start, end) {
//   const url = `https://hapi.fhir.org/baseR4/Slot?status=free&start=ge${start}&start=lt${end}&_sort=start&_count=10`;

//   const res = await axios.get(url);
//   return res.data;
// }

// // 3. Book appointment
// export async function createAppointment(payload) {
//   const url = "https://hapi.fhir.org/baseR4/Appointment";

//   const res = await axios.post(url, payload, {
//     headers: {
//       "Content-Type": "application/fhir+json"
//     }
//   });

//   return res.data;
// }




import axios from "axios";

export async function fetchDoctors(specialty) {
  const url =
    `https://npiregistry.cms.hhs.gov/api/?version=2.1&taxonomy_description=${encodeURIComponent(
      specialty
    )}&enumeration_type=NPI-1&limit=6`;

  const response = await axios.get(url);

  return response.data;
}

export async function fetchSlots(
  start_datetime,
  end_datetime
) {
  const url =
    `https://hapi.fhir.org/baseR4/Slot?status=free&start=ge${start_datetime}&start=lt${end_datetime}&_sort=start&_count=10`;

  const response = await axios.get(url);

  return response.data;
}


export async function createAppointment(payload) {
  const response = await axios.post(
    "https://hapi.fhir.org/baseR4/Appointment",
    payload,
    {
      headers: {
        "Content-Type": "application/fhir+json",
        Accept: "application/fhir+json"
      }
    }
  );

  return response.data;
}