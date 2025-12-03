import React from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";

export const BasicButton = ({ handleClick, buttonText, disabled = false, ...props }) => {
    return (
        <Button
            variant="contained"
            color="primary"
            onClick={e => {
                handleClick(e);
            }}
            disabled={disabled}
            {...props}
        >
            {buttonText}
        </Button>
    );
};

BasicButton.propTypes = {
    handleClick: PropTypes.func.isRequired,
    buttonText: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};
