import React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

export const MRTDataTableTitle = ({ title }) => {
    return (
        <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
            <Typography variant="h5">{title}</Typography>
        </Box>
    );
};
