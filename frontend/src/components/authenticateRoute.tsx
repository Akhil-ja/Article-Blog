import { Navigate, Outlet, useLocation } from "react-router-dom";

export const AuthenticatedRoute = () => {
  const location = useLocation();
  const authInfo = localStorage.getItem("authInfo");
  const publicOnlyRoutes = [
    "/register",
    "/login",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
  ];

  let isAuthenticated = false;

  try {
    isAuthenticated = authInfo ? JSON.parse(authInfo) : false;
  } catch (error) {
    console.error("Error parsing auth info:", error);
    sessionStorage.removeItem("authInfo");
  }

  if (isAuthenticated && publicOnlyRoutes.includes(location.pathname)) {
    return <Navigate to="/user/home" replace />;
  }

  if (!isAuthenticated && !publicOnlyRoutes.includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthenticatedRoute;
