import React from "react";
import TextField from "@mui/material/TextField";

export const Input = props => {
    return (
        <TextField
            margin="normal"
            fullWidth={true}
            id={props.id}
            label={props.label}
            autoFocus={props.autoFocus}
            size="medium"
            {...props}
        />
    );
};
