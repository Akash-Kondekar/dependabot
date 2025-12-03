import React from "react";
import { styled, useTheme } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import {
    Brightness4 as Brightness4Icon,
    Brightness7 as Brightness7Icon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react";
import session from "../../state/store/session";
import { ColorModeContext } from "../Routes/Routes";
import { DExtERFullLogo, DExtERMinLogo } from "../../utils";
import Feedback from "../Feedback";
import projectDetailsStore from "../../state/store/projects/details";
import Box from "@mui/material/Box";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import { drawerWidth } from "../../constants/index.jsx";

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: prop => prop !== "open",
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

export const DisplayHeader = observer(() => {
    const navigate = useNavigate();
    const theme = useTheme();

    const isDarkMode = theme.palette.mode === "dark";
    const handleLogout = async event => {
        event.preventDefault();
        await session.logout();
        projectDetailsStore.resetProject();
        navigate("/login");
    };

    const toggleDrawer = () => {
        projectDetailsStore.saveMenuStatus(!session.open);
        session.setDrawerStatus(!session.open);
    };

    React.useEffect(() => {
        (async () => {
            if (!session.checked) {
                if (!session.loading) {
                    await session.check();
                    if (!session.loggedIn) {
                        await session.logout();
                        projectDetailsStore.resetProject();
                        navigate("/login");
                    }
                }
                return "Loading...";
            }
        })();
    }, []);

    function ThemeToggleButton() {
        const colorMode = React.useContext(ColorModeContext);
        return (
            <Tooltip title={isDarkMode ? "Light mode" : "Dark mode"}>
                <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                    {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Tooltip>
        );
    }

    const ClientFullLogo = () => {
        return (
            <img
                style={{ maxHeight: 40, marginLeft: 16 }}
                src={"https://www.birmingham.ac.uk/assets/img/icons/uob-logo.svg"}
                alt={"Client full logo"}
                loading="lazy"
            />
        );
    };

    return (
        <AppBar position="fixed" open={session.open}>
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: 0,
                }}
            >
                {/* Left section with logos */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        height: 64,
                    }}
                >
                    {/* Dexter logo in a white box */}
                    <Box
                        sx={{
                            borderRadius: session.open ? "" : "50%",
                            padding: "8px",
                            height: session.open ? "100%" : 48,
                            bgcolor: isDarkMode
                                ? session.open
                                    ? theme.palette.background.paper
                                    : "white"
                                : "white",
                            width: session.open ? drawerWidth : 48,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: session.open ? "space-between" : "center",
                            paddingX: 2,
                            boxSizing: "border-box",
                            marginLeft: session.open ? "" : "4px",
                        }}
                    >
                        {session.open ? (
                            <>
                                <DExtERFullLogo />
                                <IconButton onClick={toggleDrawer} size="small">
                                    <ChevronLeft />
                                </IconButton>
                            </>
                        ) : (
                            <IconButton onClick={toggleDrawer} size="small" sx={{ p: 0 }}>
                                <DExtERMinLogo />
                            </IconButton>
                        )}
                    </Box>

                    {/* University logo */}
                    <ClientFullLogo />
                </Box>

                {/* Right section with actions */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Feedback />
                    <ThemeToggleButton />
                    <IconButton color="inherit" onClick={handleLogout}>
                        <Tooltip
                            placement="bottom"
                            title={`Log Out ${session.loggedInUserFullName}  (${session.loggedInUserSystemRole})`}
                        >
                            <Badge color="secondary">
                                <ExitToAppIcon />
                            </Badge>
                        </Tooltip>
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
});
