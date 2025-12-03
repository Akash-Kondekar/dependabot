import React from "react";
import { BasicLink } from "../Common/BasicLink.jsx";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";

function Documentation() {
    const navigate = useNavigate();
    return (
        <div style={{ padding: "10px" }}>
            <BasicLink
                handleClick={() => navigate("/home/new")}
                buttonText="Back to Home"
                displayArrow={true}
            />
            <Typography variant="h2" align="center">
                Coming soon...
            </Typography>
        </div>
    );
}
export default Documentation;
