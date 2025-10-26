import api from "./services/api";
import { clearToken } from "./utils/auth";
import sessionManager from "./utils/sessionManager";

const handleLogout = async (nav) => {
  console.log("In logout");
  try {
    // Use session manager for manual logout
    await sessionManager.manualLogout();
    nav("/login/select");
  } catch (error) {
    console.error(error);
    // Fallback: clear token and navigate even if API call fails
    clearToken();
    nav("/login/select");
  }
};
export default handleLogout;
