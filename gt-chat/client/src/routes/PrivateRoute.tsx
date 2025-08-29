import { Navigate } from "react-router-dom";
import { getToken } from "../Services/authService";

const PrivateRoute = ({ children }) => {
  const token = getToken();
  return token ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
