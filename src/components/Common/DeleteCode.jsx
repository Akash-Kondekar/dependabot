import React from "react";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

export const DeleteCode = (mode, ...props) => {
    return (
        <DeleteOutlineOutlinedIcon
            aria-label="delete"
            style={{
                display: mode === "modify" ? "none" : "block",
            }}
            color="secondary"
            {...props}
        ></DeleteOutlineOutlinedIcon>
    );
};
