import React from "react";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { BasicLink } from "./Common/BasicLink.jsx";

//TODO: Delete this component and all references to it upon release of new UI
function ComingSoon() {
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
export default ComingSoon;
