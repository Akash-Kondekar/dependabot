import React from "react";
import { styled, useTheme } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import BaseIconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { ChevronRight, LightMode as LightMode } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react";
import session from "../../state/store/session";
import { ThemeContext } from "../Common/ContextProvider.jsx";
import { DExtERFullLogo, DExtERMinLogo } from "../../utils";
import Box from "@mui/material/Box";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import { drawerWidth } from "../../constants/index.jsx";
import Chip from "@mui/material/Chip";
import { ToggleDesign } from "../../components/Admin/ToggleDesign.jsx";
import AccountCircle from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Popover from "@mui/material/Popover";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";

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

const IconButton = styled(BaseIconButton)(({ theme }) => ({
    backgroundColor:
        theme.palette.mode === "dark" ? theme.palette.grey.light : theme.palette.background.paper,
    margin: "0 8px",
}));

const ArrowButton = styled(BaseIconButton)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: "white",
    position: "absolute",
    left: session.open ? "225px" : "42px",
    top: "40px",
    fontSize: "1rem",
    padding: 0,
    "&:hover": {
        backgroundColor: theme.palette.primary.dark,
    },
}));

const AccountDropdown = ({ userName, role }) => {
    return (
        <List sx={{ width: 200 }}>
            <ListItem sx={{ paddingLeft: 0, paddingRight: 0 }}>
                <AccountCircle fontSize="large" sx={{ marginRight: "8px" }} color="primary" />
                <Tooltip title={userName}>
                    <ListItemText
                        primary={userName}
                        secondary={role}
                        sx={{
                            "& .MuiTypography-root": {
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                            },
                        }}
                    />
                </Tooltip>

                <KeyboardArrowDownIcon />
            </ListItem>
        </List>
    );
};

const ProfileButton = ({ handleProfile }) => {
    return (
        <ListItemButton onClick={handleProfile}>
            <ListItemIcon style={{ minWidth: "40px" }} aria-label="profile-icon">
                <AccountCircleOutlinedIcon color="primary" />
            </ListItemIcon>

            <ListItemText primary="Profile" />
        </ListItemButton>
    );
};

const LogoutButton = ({ handleLogout }) => {
    return (
        <ListItemButton onClick={handleLogout}>
            <ListItemIcon style={{ minWidth: "40px" }} aria-label="logout-icon">
                <LogoutIcon color="primary" />
            </ListItemIcon>

            <ListItemText primary="Logout" />
        </ListItemButton>
    );
};

const DisplayHeader = observer(() => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const navigate = useNavigate();
    const theme = useTheme();

    const isDarkMode = theme.palette.mode === "dark";

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = async event => {
        event.preventDefault();
        navigate("/profile/new");
        handleClose();
    };

    const handleLogout = async event => {
        event.preventDefault();
        await session.logout();
        navigate("/login");
        handleClose();
    };

    const toggleDrawer = () => {
        session.setDrawerStatus(!session.open);
    };

    React.useEffect(() => {
        (async () => {
            if (!session.checked) {
                if (!session.loading) {
                    await session.check();
                    if (!session.loggedIn) {
                        await session.logout();
                        navigate("/login");
                    }
                }
                return "Loading...";
            }
        })();
    }, []);

    function ThemeToggleButton() {
        const colorMode = React.useContext(ThemeContext);
        return (
            <Tooltip title={isDarkMode ? "Light mode" : "Dark mode"}>
                <IconButton
                    onClick={colorMode.toggleColorMode}
                    color={isDarkMode ? "white" : "primary"}
                    aria-label="Theme"
                >
                    <LightMode />
                </IconButton>
            </Tooltip>
        );
    }

    const ClientFullLogoLight = () => {
        return (
            <img
                style={{ maxHeight: 40, marginLeft: 16 }}
                src={"/assets/img/newImages/UOB-logo-light.png"}
                alt={"Client full logo"}
                loading="lazy"
            />
        );
    };

    const ClientFullLogoDark = () => {
        return (
            <img
                style={{ maxHeight: 40, marginLeft: 16 }}
                src={"/assets/img/newImages/UOB-logo-dark.png"}
                alt={"Client full logo"}
                loading="lazy"
            />
        );
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    return (
        <AppBar position="fixed" open={session.open}>
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: 0,
                    bgcolor: isDarkMode ? "grey.main" : "grey.light",
                }}
            >
                {/* Left section with logos */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        height: 70,
                    }}
                >
                    {/* Dexter logo in a white box */}
                    <Box
                        sx={{
                            borderRadius: session.open ? "" : "50%",
                            padding: "8px",
                            height: session.open ? "100%" : 48,
                            bgcolor: isDarkMode ? "grey.main" : "grey.light",
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
                                <ArrowButton
                                    onClick={toggleDrawer}
                                    size="small"
                                    color="primary"
                                    aria-label="Collapse Menu"
                                >
                                    <ChevronLeft fontSize="small" />
                                </ArrowButton>
                            </>
                        ) : (
                            <>
                                <DExtERMinLogo />
                                <ArrowButton
                                    onClick={toggleDrawer}
                                    size="smaller"
                                    sx={{ p: 0 }}
                                    color="primary"
                                    aria-label="Expand Menu"
                                >
                                    <ChevronRight fontSize="small" />
                                </ArrowButton>
                            </>
                        )}
                    </Box>

                    {/* University logo */}
                    {isDarkMode ? <ClientFullLogoDark /> : <ClientFullLogoLight />}
                </Box>

                {/* Right section with actions */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ThemeToggleButton />

                    {session.isAdmin && <ToggleDesign />}
                    <Chip
                        label={
                            <AccountDropdown
                                userName={session.loggedInUserFullName}
                                role={session.loggedInUserSystemRole}
                            />
                        }
                        variant="outlined"
                        sx={{
                            height: "50px",
                            width: "220px",
                            borderRadius: "30px",
                        }}
                        onClick={handleClick}
                        aria-describedby={id}
                    />
                    <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                        }}
                        sx={{
                            marginLeft: "10px",
                        }}
                    >
                        <List sx={{ width: 200 }}>
                            <ProfileButton handleProfile={handleProfile} />
                            <LogoutButton handleLogout={handleLogout} />
                        </List>
                    </Popover>
                </Box>
            </Toolbar>
        </AppBar>
    );
});

export default DisplayHeader;
