import React from "react";
import { TextField } from "@mui/material";

export const NumberInput = ({ min = 1, max = 99, required = false, ...props }) => {
    return (
        <TextField
            type="number"
            margin="normal"
            required={required}
            slotProps={{
                inputLabel: {
                    shrink: true,
                },
                inputProps: {
                    min,
                    max,
                },
            }}
            fullWidth={true}
            {...props}
        />
    );
};
