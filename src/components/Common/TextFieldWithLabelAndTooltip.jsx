import React from "react";
import { TextField, Tooltip } from "@mui/material";

export const TextFieldWithLabelAndTooltip = ({
    textboxLabel,
    textboxID,
    autoFocus = false,
    tooltipLabel,
    tooltipPlacement = "left",
    setInput,
}) => {
    return (
        <Tooltip title={tooltipLabel} placement={tooltipPlacement}>
            <TextField
                onChange={e => setInput(e.target.value)}
                margin="normal"
                required
                fullWidth={true}
                id={textboxID}
                label={textboxLabel}
                name={textboxID}
                autoFocus={autoFocus}
                slotProps={{
                    inputLabel: {
                        shrink: true,
                    },
                }}
            />
        </Tooltip>
    );
};
