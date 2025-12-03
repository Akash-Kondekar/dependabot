import React from "react";
import { Container } from "@mui/system";
import { IconButton, Typography } from "@mui/material";
import { Drafts } from "@mui/icons-material";

export const NoData = ({ message }) => {
    return (
        <Container>
            <div style={{ textAlign: "center" }}>
                <IconButton disabled={true}>
                    <Drafts sx={{ fontSize: 40, color: "#e6e6e6" }} />
                </IconButton>

                <Typography color="#9a9fa6" sx={{ paddingLeft: "8px", fontSize: "18px" }}>
                    {" "}
                    No Data
                </Typography>
                <Typography color="#9a9fa6" sx={{ paddingLeft: "8px", fontSize: "18px" }}>
                    {message}
                </Typography>
                <br />
            </div>
        </Container>
    );
};
