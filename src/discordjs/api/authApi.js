import axios from "axios";

const authBaseUrl = "http://localhost:3001/api/unyfi/auth";

export async function addUser(user) {
  return await axios.post(`${authBaseUrl}/add_user`, user);
}
