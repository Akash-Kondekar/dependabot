import React from "react";
import Link from "@mui/material/Link";
import { ArrowBack } from "@mui/icons-material";
import { ArrowForward } from "@mui/icons-material";

export const BasicLink = ({
    buttonText,
    handleClick,
    color = "inherit",
    underline = "always",
    fontWeight = "700",
    variant = "body1",
    disabled = false,
    displayArrow = false,
    displayArrowFwd = false,
    ...props
}) => {
    return (
        <Link
            component="button"
            variant={variant}
            type="button"
            onClick={() => {
                handleClick();
            }}
            underline={underline}
            color={color}
            style={{
                opacity: disabled && 0.5,
                pointerEvents: disabled ? "none" : "all",
            }}
            {...props}
        >
            <div
                style={{
                    fontWeight: fontWeight,
                }}
            >
                {displayArrow && (
                    <>
                        <ArrowBack sx={{ verticalAlign: "middle" }} fontSize="small" />{" "}
                        {buttonText}{" "}
                    </>
                )}
                {displayArrowFwd && (
                    <>
                        {buttonText}
                        <ArrowForward sx={{ verticalAlign: "middle" }} fontSize="small" />
                    </>
                )}

                {!displayArrow && !displayArrowFwd && buttonText}
            </div>
        </Link>
    );
};
