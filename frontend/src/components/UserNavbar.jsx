import { useDispatch } from "react-redux";
import { logoutUser } from "@/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";

const UserNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authInfo = sessionStorage.getItem("authInfo");

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate("/login");
    });
    sessionStorage.removeItem("authInfo");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "white" }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "black",
          }}
        >
          Image Gallary
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {authInfo && (
            <Button onClick={handleLogout} color="inherit" variant="outlined">
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default UserNavbar;
