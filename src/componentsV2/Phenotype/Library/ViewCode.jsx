import React from "react";
import { BasicLink } from "../../Common/BasicLink.jsx";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";

const ViewCode = () => {
    const navigate = useNavigate();
    return (
        <div style={{ padding: "10px", minHeight: "70vh" }}>
            <BasicLink
                handleClick={() => navigate("/home/new")}
                buttonText="Back to Dashboard"
                displayArrow={true}
            />
            <Typography variant="h2" align="center" sx={{ marginTop: "3%" }}>
                Coming soon...
            </Typography>
        </div>
    );
};

export default ViewCode;
