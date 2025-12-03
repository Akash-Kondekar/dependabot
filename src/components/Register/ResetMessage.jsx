import React from "react";

import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";

import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles(theme => ({
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
    },
    redIcon: {
        margin: "30px",
        color: "red",
    },
    greenIcon: {
        margin: "30px",
        color: "green",
    },
}));

export function ResetMessage({ msg, success }) {
    const classes = useStyles();

    return (
        <div className={classes.paper}>
            <Paper
                className={classes.paper}
                elevation={3}
                sx={{
                    minWidth: "650px",
                    padding: "20px",
                }}
            >
                <Typography>
                    {success && (
                        <CheckIcon sx={{ fontSize: "xxx-large" }} className={classes.greenIcon} />
                    )}
                    {!success && (
                        <CancelIcon sx={{ fontSize: "xxx-large" }} className={classes.redIcon} />
                    )}
                </Typography>
                <Typography style={{ fontSize: "x-large" }}>{msg}</Typography>
                <Typography style={{ fontSize: "large", margin: "20px" }}>
                    <a href="/login">Return to login</a>
                </Typography>
            </Paper>
        </div>
    );
}
