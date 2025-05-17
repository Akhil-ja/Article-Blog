import { useDispatch } from "react-redux";
import { logoutUser } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import {
  AccountCircle,
  Logout,
  Article,
  Assessment,
} from "@mui/icons-material";
import { AppDispatch } from "../store";

const UserNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const authInfo = localStorage.getItem("authInfo");

  const user = authInfo ? JSON.parse(authInfo) : null;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [activeTab, setActiveTab] = useState(0);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/user/home") {
      setActiveTab(0);
    } else if (location.pathname === "/user/my-articles") {
      setActiveTab(1);
    } else if (location.pathname === "/user/activities") {
      setActiveTab(2);
    }
  }, [location.pathname]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/user/profile");
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logoutUser()).then(() => {
      navigate("/login");
      localStorage.removeItem("authInfo");
    });
  };

  const handleTabChange = (event, newValue: any) => {
    setActiveTab(newValue);

    if (newValue === 0) {
      navigate("/user/home");
    } else if (newValue === 1) {
      navigate("/user/my-articles");
    } else if (newValue === 2) {
      navigate("/user/activities");
    }
  };

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "white", borderRadius: "2px" }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          onClick={() => {
            navigate("/user/home");
          }}
          style={{ cursor: "pointer" }}
          component="div"
          sx={{
            flexGrow: 0,
            display: "flex",
            alignItems: "center",
            color: "#1976d2",
            mr: 4,
            fontSize: "15px",
          }}
        >
          Article Feeds
        </Typography>

        {authInfo && (
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ flexGrow: 1 }}
          >
            <Tab label="Home" />
            <Tab
              icon={<Article fontSize="small" />}
              iconPosition="start"
              label="My Articles"
            />
            <Tab
              icon={<Assessment fontSize="small" />}
              iconPosition="start"
              label="My Activities"
            />
          </Tabs>
        )}

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {authInfo && (
            <>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  aria-controls={open ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                >
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                    src={user?.profileImage || ""}
                  >
                    {!user?.profileImage && (user?.name?.[0] || "U")}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                    mt: 1.5,
                    width: 200,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
              >
                <MenuItem onClick={handleProfileClick}>
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/user/my-articles");
                  }}
                >
                  <ListItemIcon>
                    <Article fontSize="small" />
                  </ListItemIcon>
                  My Articles
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/user/activities");
                  }}
                >
                  <ListItemIcon>
                    <Assessment fontSize="small" />
                  </ListItemIcon>
                  My Activities
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default UserNavbar;
