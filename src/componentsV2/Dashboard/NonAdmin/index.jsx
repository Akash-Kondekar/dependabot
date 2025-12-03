import differenceInCalendarDays from "date-fns/differenceInDays";
import React from "react";
import Grid from "@mui/material/Grid2";

import { observer } from "mobx-react";

import session from "../../../state/store/session.js";

import LatestStudiesAndCodes from "./LatestStudiesAndCodes.jsx";
import ExtractionService from "./ExtractionStatus.jsx";
import ExpiringDatabases from "./ExpiringDatabases.jsx";
import ExpiringClient from "./ExpiringClient.jsx";
import dashboardStore from "../../../state/store/dashboard.js";

export const getExpiryDateString = date => {
    if (date === null) return null;
    const now = new Date();
    const diffInDays = differenceInCalendarDays(
        new Date(date).getTime(),
        new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    );
    if (diffInDays > 30) {
        return null;
    }
    let abbr = "in " + diffInDays + " days";
    if (diffInDays === 1) {
        abbr = "tomorrow";
    }
    if (diffInDays === 0) {
        abbr = "today";
    }
    if (diffInDays >= 7) {
        abbr = "in " + Math.floor(diffInDays / 7) + " week(s)";
    }
    return abbr;
};

const NonAdminDashboard = observer(() => {
    if (session.isAdmin) {
        return;
    }

    //Conditions to make the second grid take full width when there are no studies and codes for logged in user
    const hasStudiesAndCodes = dashboardStore.hasStudiesAndCodes;
    const secondGridSize = hasStudiesAndCodes ? 4 : 12;

    return (
        <div>
            <Grid container spacing={2} sx={{ m: "2%" }}>
                <LatestStudiesAndCodes />
                <Grid size={secondGridSize}>
                    <ExtractionService />
                    <ExpiringClient />
                    <ExpiringDatabases />
                </Grid>
            </Grid>
        </div>
    );
});

export default NonAdminDashboard;
