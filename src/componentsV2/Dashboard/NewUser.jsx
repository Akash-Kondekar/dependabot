import React from "react";
import Typography from "@mui/material/Typography";
import NewUserImg from "../assets/new-user-image.svg?react";
import { CustomSVGImage } from "../Common/CustomSVGImage.jsx";
import { BasicLink } from "../Common/BasicLink";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import dashboardStore from "../../state/store/dashboard.js";
import { observer } from "mobx-react";
import session from "../../state/store/session";

export const NewUserDashboard = observer(() => {
    const navigate = useNavigate();

    if (dashboardStore.busy || dashboardStore.hasStudiesAndCodes || session.isAdmin) {
        return;
    }

    return (
        <Container maxWidth="md" style={{ textAlign: "center", padding: "2rem" }}>
            <CustomSVGImage
                alt="Dexter-new-user"
                style={{ maxWidth: "100%", height: "auto", marginBottom: "1rem" }}
                Image={NewUserImg}
            />
            <Typography variant="h3" align="center">
                Welcome to Dexter.
            </Typography>
            <Typography variant="h5" align="center">
                Your fastest path from real-world data to real-world impact. Get started here.
                <BasicLink
                    buttonText="Documentation"
                    color="primary.link"
                    handleClick={() => navigate("/help/new")}
                    sx={{ fontSize: "24px", verticalAlign: "top" }} //Overwrite the default font size
                />
            </Typography>
        </Container>
    );
});
