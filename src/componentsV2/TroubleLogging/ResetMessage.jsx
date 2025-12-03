import React from "react";

import Typography from "@mui/material/Typography";

import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import Container from "@mui/material/Container";

export function ResetMessage({ msg, success }) {
    return (
        <Container component="main" maxWidth="sm" sx={{ textAlign: "center", marginTop: "4vw" }}>
            {success && <CheckIcon sx={{ fontSize: "8rem" }} color="primary" />}
            {!success && <CancelIcon sx={{ fontSize: "8rem" }} color="error" />}
            <Typography variant="h5" sx={{ fontWeight: 500, mt: 3 }}>
                {msg}
            </Typography>
        </Container>
    );
}
