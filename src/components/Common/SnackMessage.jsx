import React from "react";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

export const SnackMessage = ({ open, handleClose, severity, message }) => {
    function Alert(props) {
        return <MuiAlert elevation={6} variant="filled" {...props} />;
    }

    return (
        <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            open={open}
            onClose={() => handleClose(false)}
        >
            <Alert onClose={() => handleClose(false)} severity={severity}>
                {message}
            </Alert>
        </Snackbar>
    );
};
