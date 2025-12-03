import React from "react";
import { Typography } from "@mui/material";

export const CardHeader = ({ title }) => {
    return (
        <Typography component={"span"} variant="h6">
            {title}
        </Typography>
    );
};
