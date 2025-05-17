import React from "react";
import { Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const FloatingCreateButton = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 999,
      }}
    >
      <Button
        onClick={() => navigate("/user/create-article")}
        variant="contained"
        color="primary"
        sx={{
          borderRadius: "50px",
          height: "56px",
          minWidth: "56px",
          px: 2,
          boxShadow: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transition: "all 0.3s ease",
          "&:hover": {
            minWidth: "160px",
          },
        }}
      >
        <Box
          component="span"
          sx={{
            whiteSpace: "nowrap",
            opacity: 0,
            ml: 1,
            fontSize: 14,
            transition: "opacity 0.3s ease",
            visibility: "hidden",
            "&.visible": {
              opacity: 1,
              visibility: "visible",
            },
          }}
          className="expandText visible"
        >
          Create Article
        </Box>
        <Box component="span" sx={{ fontSize: 24, px: "5px" }}>
          +
        </Box>
      </Button>
    </Box>
  );
};

export default FloatingCreateButton;
