import React from "react";
import { TextField } from "@mui/material";

export const Input = props => {
    return (
        <TextField
            margin="normal"
            fullWidth={true}
            id={props.id}
            label={props.label}
            autoFocus={props.autoFocus}
            {...props}
        />
    );
};
