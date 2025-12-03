import React from "react";
import { InputAdornment, Typography } from "@mui/material";
import { UNIT_OF_TIME } from "../../constants";

export const NumberInputAdornment = ({ position = "end", value = UNIT_OF_TIME }) => {
    return (
        <InputAdornment position={position}>
            {/* Explicitly set the component to "span" to avoid nesting <p> elements */}
            <Typography component="span">{value}</Typography>
        </InputAdornment>
    );
};
