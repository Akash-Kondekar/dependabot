import React from "react";
import { Container, Typography } from "@mui/material";
import session from "../../state/store/session";
import { AccessDenied } from "../Common";

const AdminHome = () => {
    const canAccessAdminPage = session.isAdmin || session.isModerator;

    if (!canAccessAdminPage) {
        return <AccessDenied />;
    }

    return (
        <Container
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "32px",
            }}
        >
            <div>
                {
                    <Typography component="h1" variant="h4" color="inherit" noWrap>
                        Welcome to Admin settings page
                    </Typography>
                }
            </div>
        </Container>
    );
};

export default AdminHome;
