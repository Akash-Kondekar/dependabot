import React from "react";
import { Container, IconButton, Typography } from "@mui/material";
import { HighlightOff } from "@mui/icons-material";
import { BasicButton } from "./BasicButton";
import { useNavigate } from "react-router-dom";

export const AccessDenied = () => {
    const navigate = useNavigate();

    function goHome() {
        navigate("/home");
    }
    return (
        <Container>
            <div style={{ textAlign: "center", marginTop: "10%" }}>
                <IconButton disabled={true}>
                    <HighlightOff sx={{ fontSize: 85, color: "#ff4d4f" }} />
                </IconButton>

                <Typography
                    color="rgba(0,0,0,.88)"
                    sx={{
                        paddingLeft: "8px",
                        fontSize: "24px",
                        marginTop: "14px",
                    }}
                >
                    Access Denied
                </Typography>
                <Typography
                    color="#00000040"
                    sx={{
                        paddingLeft: "8px",
                        fontSize: "20px",
                        marginTop: "10px",
                    }}
                >
                    You do not have access to this page
                </Typography>
                <br />
                <BasicButton
                    color="primary"
                    variant="contained"
                    handleClick={goHome}
                    sx={{ mr: 1 }}
                    buttonText="Go Home"
                />
            </div>
        </Container>
    );
};
