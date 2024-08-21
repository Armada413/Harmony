import axios from "axios";

const juryBaseUrl = "http://localhost:3001/api/unyfi/jury";

export async function makeReport(report) {
  return await axios.post(`${juryBaseUrl}/report`, report);
}

export async function createJuryRequest(case_id) {
  return await axios.post(`${juryBaseUrl}/request`, case_id);
}
export async function updateJuryRequest(update) {
  return await axios.patch(`${juryBaseUrl}/update_request`, update);
}
