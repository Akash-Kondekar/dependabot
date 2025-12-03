import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import { observer } from "mobx-react";
import session from "../../state/store/session";
import MainMenuItems from "./Items";
import { useLocation } from "react-router-dom";
import { drawerWidth } from "../../constants/index.jsx";
import { useTheme } from "@emotion/react";

export const Menu = observer(() => {
    const location = useLocation();

    const pathName = location.pathname;

    const SHOW_MENU = {
        MAIN: "MAIN",
        ANALYTICS: "ANALYTICS",
    };

    const type = pathName?.indexOf("/analytics") > -1 ? SHOW_MENU.ANALYTICS : SHOW_MENU.MAIN;
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    return (
        <Box
            sx={{
                flexShrink: 0,
                width: session.open ? drawerWidth : theme => theme.spacing(7),
                position: "relative", // Add this to make the container relative
                bgcolor: theme => theme.palette.grey.light,
            }}
        >
            <CssBaseline />
            <Drawer
                variant="permanent"
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
                        border: "none",
                        bgcolor: isDarkMode ? "grey.main" : "grey.light",
                        whiteSpace: "nowrap",
                    },
                }}
            >
                <MainMenuItems type={type} />
            </Drawer>
        </Box>
    );
});
