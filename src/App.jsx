import React from "react";
import { Outlet } from "react-router-dom";
import { DisplayHeader } from "./components/Header/index.jsx";
import { DisplayMenu } from "./components/Menu/index.jsx";
import session from "./state/store/session";
import { observer } from "mobx-react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { drawerWidth } from "./constants/index.jsx";
import Header from "./componentsV2/Header/Header.jsx";
import { Menu } from "./componentsV2/Menu/index.jsx";
import systemConfiguration from "./state/store/admin/systemConfiguration.js";
import CssBaseline from "@mui/material/CssBaseline";
import "./App.css";

const App = observer(() => {
    const { isTermsAccepted } = session;

    const DisplayHeaderAndMenu = () => {
        return (
            <>
                {import.meta.env.VITE_SWITCH_TO_NEW_DESIGN === "true" &&
                systemConfiguration.data === "true" ? (
                    <>
                        <Header />
                        <Menu />
                    </>
                ) : (
                    <>
                        <DisplayHeader />
                        <DisplayMenu />
                    </>
                )}
            </>
        );
    };

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            {isTermsAccepted && <DisplayHeaderAndMenu />}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 1,
                    width: { sm: `calc(100% - ${session.open ? drawerWidth : 56}px)` },
                    transition: theme =>
                        theme.transitions.create(["width", "margin"], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                }}
            >
                <Toolbar /> {/* This creates space equivalent to header height */}
                <Outlet />
            </Box>
        </Box>
    );
});

export default App;
