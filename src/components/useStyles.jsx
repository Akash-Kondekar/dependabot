// import React from "react";
// import clsx from "clsx";
import makeStyles from "@mui/styles/makeStyles";
import { drawerWidth } from "../constants/index.jsx";

export const useStyles = makeStyles(theme => ({
    root: {
        width: "100%",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    paperForPublications: {
        // marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    toolbar: {
        paddingRight: 18, // keep right padding when drawer closed
    },
    toolbarIcon: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 8px",
        ...theme.mixins.toolbar,
    },
    appBar: {
        zIndex: theme.zIndex.drawer,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    menuButtonHidden: {
        display: "none",
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: {
        position: "relative",
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.backgroundColor, // Controls the color of the menu background.
        whiteSpace: "nowrap",
        width: drawerWidth,
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: "hidden",
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(5),
        [theme.breakpoints.up("sm")]: {
            width: theme.spacing(7),
        },
    },

    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        // height: "100vh",
        overflow: "auto",
    },
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    paper: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
    },
    paperForMatching: {
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
    },
    paperForNewStudy: {
        padding: theme.spacing(1),
        color: theme.palette.text.secondary,
        backgroundColor: "#FFEEDD",
    },
    paper2: {
        padding: theme.spacing(1),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        backgroundColor: "#FFEEDD",
        margin: theme.spacing(1),
    },
    paper3: {
        padding: theme.spacing(1),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        margin: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    fixedHeight: {
        height: 240,
    },
    forControlDropDown: {
        width: "70%",
    },
    mRight: {
        marginRight: "5%",
    },
    paper8: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    projectTitle: {
        fontSize: 14,
    },
    getCodes: {
        marginRight: "10px",
        display: "inline",
        top: "5px",
        position: "relative",
    },
    toolbarExpanded: {
        backgroundColor: theme.palette.background.paper,
        marginRight: "10px",
        display: "flex",
        paddingLeft: "24px",
        alignItems: "center",
    },
}));
