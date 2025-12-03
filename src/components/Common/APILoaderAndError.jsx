import React from "react";
import withStyles from "@mui/styles/withStyles";
import CircularProgress from "@mui/material/CircularProgress";

const styles = {
    root: {
        marginLeft: 5,
    },
};

export const SpinnerAdornment = withStyles(styles)(props => (
    <CircularProgress className={props.classes.spinner} color="secondary" size={20} />
));
