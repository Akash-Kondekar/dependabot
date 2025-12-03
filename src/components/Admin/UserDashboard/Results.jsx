import React from "react";
import { Typography, Icon } from "@mui/material";
import { CheckCircle, DoNotDisturbOn, HighlightOff } from "@mui/icons-material";
import Users from "../../../state/store/admin/users";
import { observer } from "mobx-react";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles(() => ({
    root: {
        marginRight: "5px",
        paddingBottom: "24px",
        overflow: "visible",
    },
}));

const Results = observer(() => {
    const { invited, skipped, invalid } = Users.uploadedResults;
    const classes = useStyles();

    const textAlign = {
        verticalAlign: "text-bottom",
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Typography>Results: </Typography>
            <span>
                <Icon color="success" className={classes.root}>
                    <CheckCircle />
                </Icon>
                <span style={textAlign}>{invited?.length} invited</span>
            </span>
            <span>
                <Icon color="info" className={classes.root}>
                    <HighlightOff />
                </Icon>
                <span style={textAlign}> {skipped?.length} skipped </span>
            </span>
            <span>
                <Icon color="error" className={classes.root}>
                    <DoNotDisturbOn />
                </Icon>
                <span style={textAlign}> {invalid?.length} invalid </span>
            </span>
        </div>
    );
});

export default Results;
