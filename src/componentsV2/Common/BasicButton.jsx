import React from "react";
import Button from "@mui/material/Button";

export const BasicButton = ({ handleClick, buttonText, disabled = false, sx = {}, ...props }) => {
    return (
        <Button
            variant="contained"
            color="primary"
            onClick={e => {
                handleClick(e);
            }}
            disabled={disabled}
            size="large"
            sx={{
                ...sx,
                borderRadius: "32px",
                textTransform: "capitalize",
                fontSize: "16px",
            }}
            {...props}
        >
            {buttonText}
        </Button>
    );
};
