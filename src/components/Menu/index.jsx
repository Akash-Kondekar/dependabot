import React from "react";
import clsx from "clsx";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import { useStyles } from "../useStyles";
import { observer } from "mobx-react";
import session from "../../state/store/session";
import Menu from "./Menu";
import { useLocation } from "react-router-dom";
import { drawerWidth } from "../../constants/index.jsx";

export const DisplayMenu = observer(() => {
    const classes = useStyles();
    const location = useLocation();

    const pathName = location.pathname;

    const SHOW_MENU = {
        MAIN: "MAIN",
        ANALYTICS: "ANALYTICS",
    };

    const type = pathName?.indexOf("/analytics") > -1 ? SHOW_MENU.ANALYTICS : SHOW_MENU.MAIN;

    return (
        <Box
            sx={{
                flexShrink: 0,
                width: session.open ? drawerWidth : theme => theme.spacing(7),
                position: "relative", // Add this to make the container relative
            }}
        >
            <CssBaseline />
            <Drawer
                variant="permanent"
                classes={{
                    paper: clsx(classes.drawerPaper, !session.open && classes.drawerPaperClose),
                }}
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: session.open,
                    [classes.drawerClose]: !session.open,
                })}
                open={session.open}
                sx={{
                    "& .MuiDrawer-paper": {
                        width: session.open ? drawerWidth : theme => theme.spacing(7),
                        marginTop: "64px", // Header height
                        height: "calc(100vh - 64px)",
                        boxSizing: "border-box",
                        overflowX: "hidden",
                        position: "fixed", // Change to fixed position
                        top: 0, // Align to top of viewport
                        left: 0, // Align to left of viewport
                    },
                }}
            >
                <Menu type={type} />
            </Drawer>
        </Box>
    );
});
