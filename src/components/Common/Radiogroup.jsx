import React from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";

export const Radiogroup = ({ radioOptions, value, handleChange, disabled = false }) => {
    return (
        <RadioGroup
            row
            aria-label="User Type"
            name="position"
            defaultValue="top"
            value={value}
            onChange={handleChange}
        >
            {Object.keys(radioOptions).map(value => {
                return (
                    <FormControlLabel
                        key={radioOptions[value].value}
                        value={radioOptions[value].value}
                        defaultChecked={true}
                        control={<Radio color="primary" />}
                        label={radioOptions[value].label}
                        disabled={disabled}
                    />
                );
            })}
        </RadioGroup>
    );
};
