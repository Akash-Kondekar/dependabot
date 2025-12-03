import React from "react";
import Typography from "@mui/material/Typography";
import session from "../../state/store/session";

export const AdminDashboard = () => {
    if (!session.isAdmin) {
        return;
    }
    return (
        <div>
            <Typography variant="h2" align="center">
                Coming soon...
            </Typography>
            {/* Add more admin functionalities here */}
        </div>
    );
};
