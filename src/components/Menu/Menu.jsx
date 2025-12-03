import React from "react";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import makeStyles from "@mui/styles/makeStyles";
import List from "@mui/material/List";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ArticleIcon from "@mui/icons-material/Article";
import PersonIcon from "@mui/icons-material/Person";

import Tooltip from "@mui/material/Tooltip";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Collapse, Divider, ListItemButton } from "@mui/material";
import {
    Apps,
    ArrowCircleLeft,
    Description,
    ExpandLess,
    ExpandMore,
    ManageAccounts,
    People,
    QueryStats,
    Widgets,
} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { useTheme } from "@mui/material/styles";
import session from "../../state/store/session";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import projectDetailsStore from "../../state/store/projects/details";
import commonAnalyticsStore from "../../state/store/study/analytics/common";

const projectMenuTitle = "My Projects";

const useStyles = makeStyles(theme => {
    return {
        root: {
            width: "100%",
            maxWidth: 360,
            background: {
                paper: "#000000",
            },
        },
        indentText: {
            marginLeft: "20px",
            fontSize: "small",
            padding: "0px",
        },
        denseLink: {
            margin: "0px",
            padding: "0px",
        },
        link: {
            textDecoration: "none",
            color: theme.palette.text.primary,
            display: "flex",
        },
    };
});

export const MENU_ITEMS = {
    MAIN: {
        PRIMARY: "Primary",
        CODEBUILDER: "Phenotype Library",
        PROFILE: "My Profile",
        DOCUMENTATION: "Documentation",
        ADMIN: "Admin",
    },
    ANALYTICS: {
        DASHBOARD: "Dashboard",
        DATA_EXTRACTION: "Data Extraction Report",
        SUMMARY: "Summary",
        ANALYSIS: "Analysis",
        PROJECT: "Back to Project",
    },
};

const MENU = {
    MAIN: {
        [MENU_ITEMS.MAIN.PRIMARY]: [
            {
                to: "/home",
                icon: <DashboardIcon />,
                title: "Dashboard",
                subMenuItems: [],
            },
            {
                to: "/projects",
                icon: <AssignmentIndIcon />,
                title: projectMenuTitle,
                subMenuItems: [],
            },
            {
                to: "/studyprotocols",
                icon: <ArticleIcon />,
                title: "Study Protocols",
                subMenuItems: [],
            },
        ],
        [MENU_ITEMS.MAIN.ADMIN]: [
            {
                to: "/admin",
                icon: <SettingsIcon />,
                title: "Settings",
                subMenuItems: [
                    {
                        to: "/admin/client",
                        icon: <ManageAccounts />,
                        title: "Clients",
                        indent: false,
                    },
                    {
                        to: "/admin/user",
                        icon: <People />,
                        title: "Users",
                        indent: false,
                    },
                    {
                        to: "/admin/miscellaneous",
                        icon: <Widgets />,
                        title: "Miscellaneous",
                        indent: false,
                    },
                ],
            },
        ],
        [MENU_ITEMS.MAIN.CODEBUILDER]: [
            {
                to: "/builder",
                icon: <AccountBalanceIcon />,
                title: "Phenotype Library",
            },
            {
                to: "/builder/medical",
                icon: <NoteAddIcon />,
                title: "Create Medical codes",
            },
            {
                to: "/builder/drugs",
                icon: <VaccinesIcon />,
                title: "Create Drug codes",
            },
        ],
        [MENU_ITEMS.MAIN.PROFILE]: [
            {
                to: "/profile",
                icon: <PersonIcon />,
                title: "My Profile",
                subMenuItems: [],
            },
        ],
        [MENU_ITEMS.MAIN.DOCUMENTATION]: [
            {
                to: "/help",
                title: "Documentation",
                indent: false,
                icon: <MenuBookOutlinedIcon />,
                subMenuItems: [
                    {
                        resource: "governance",
                        title: "Governance",
                        indent: false,
                        to: "/help/governance",
                    },
                    {
                        resource: "mydatabases",
                        title: "My Databases",
                        indent: false,
                        to: "/help/mydatabases",
                    },
                    {
                        resource: "projects",
                        title: "Projects",
                        indent: false,
                        to: "/help/projects",
                    },
                    {
                        resource: "codebuilder",
                        title: "Phenotype library",
                        indent: false,
                        to: "/help/phenotypelibrary",
                    },
                    {
                        resource: "studyprotocols",
                        title: "Study Protocols",
                        indent: false,
                        to: "/help/studyprotocols",
                    },
                    {
                        resource: "studydesigns",
                        title: "Study Designs",
                        indent: false,
                        to: "/help/designs",
                    },
                    {
                        resource: "studyperiod",
                        title: "Study Period",
                        indent: true,
                        to: "/help/designs/studyperiod",
                    },
                    {
                        resource: "exposed",
                        title: "Exposure",
                        indent: true,
                        to: "/help/designs/exposure",
                    },
                    {
                        resource: "controlandmatching",
                        title: "Controls and matching",
                        indent: true,
                        to: "/help/designs/controlandmatch",
                    },
                    {
                        resource: "baseline",
                        title: "Baseline",
                        indent: true,
                        to: "/help/designs/baseline",
                    },
                    {
                        resource: "outcome",
                        title: "Outcome",
                        indent: true,
                        to: "/help/designs/outcome",
                    },
                    {
                        resource: "addvariables",
                        title: "ADD VARIABLES",
                        indent: true,
                        to: "/help/designs/addvariables",
                    },
                    {
                        resource: "extractedDatasets",
                        title: "Extracted data",
                        indent: false,
                        to: "/help/extracteddata",
                    },
                    {
                        resource: "addons",
                        title: "Additional data (Addons)",
                        indent: false,
                        to: "/help/addons",
                    },
                    {
                        resource: "analytics",
                        title: "Analytics",
                        indent: false,
                        to: "/help/results",
                    },
                    {
                        resource: "cite",
                        title: "Cite Dexter",
                        indent: false,
                        to: "/help/cite",
                    },
                    {
                        resource: "privacyPolicy",
                        title: "Privacy Policy",
                        indent: false,
                        to: "/help/privacy",
                    },
                    {
                        resource: "cookiePolicy",
                        title: "Cookie Policy",
                        indent: false,
                        to: "/help/cookies",
                    },
                ],
            },
        ],
    },
    ANALYTICS: {
        [MENU_ITEMS.ANALYTICS.DASHBOARD]: [
            {
                to: "/analytics/home",
                title: "Dashboard",
                indent: false,
                icon: <DashboardIcon />,
                subMenuItems: [],
            },
        ],
        [MENU_ITEMS.ANALYTICS.DATA_EXTRACTION]: [
            {
                to: "/analytics/dataextractionreport",
                title: "Data Extraction Report",
                indent: false,
                icon: <Description />,
                subMenuItems: [],
            },
        ],
        [MENU_ITEMS.ANALYTICS.SUMMARY]: [
            {
                to: "/analytics/summary",
                title: "Summary",
                indent: false,
                icon: <LeaderboardIcon />,
                subMenuItems: [],
            },
        ],
        [MENU_ITEMS.ANALYTICS.ANALYSIS]: [
            {
                to: "/analytics/analysis",
                title: "Analysis",
                indent: false,
                icon: <QueryStats />,
                subMenuItems: [
                    {
                        to: "/analytics/analysis/overall",
                        title: "Overall",
                        indent: false,
                        icon: <Apps />,
                    },
                    {
                        to: "/analytics/analysis/subgroup",
                        title: "Subgroup",
                        indent: false,
                        icon: <Apps />,
                    },
                ],
            },
        ],
        [MENU_ITEMS.ANALYTICS.PROJECT]: [
            {
                to: "/projects",
                title: MENU_ITEMS.ANALYTICS.PROJECT,
                indent: false,
                icon: <ArrowCircleLeft />,
                subMenuItems: [],
            },
        ],
    },
};

const MainMenu = props => {
    const { type } = props;

    const data = MENU_ITEMS[type];

    const location = useLocation();
    const navigate = useNavigate();

    const pathName = location.pathname;

    React.useEffect(() => {
        //Analytics requires project id and job id, on browser refresh this will be reset to initial value. In this case, route the user back to Projects page.
        const routeToProjectsPage =
            pathName?.indexOf("/analytics") > -1 &&
            (commonAnalyticsStore.projectID === "" || commonAnalyticsStore.jobID === "");

        if (routeToProjectsPage) {
            navigate("/projects", {
                state: { title: "My Projects" },
            });
        }
    }, []);

    return (
        <div>
            {Object.keys(data).map(option => {
                return (
                    <span key={option}>
                        <GetMainMenu type={type} subType={data[option]} />
                        <Divider />
                    </span>
                );
            })}
        </div>
    );
};

const resetProjectAndRestoreDrawerStatus = (title, location) => {
    //Restore drawer status to its previous state (expanded or minimized) when user switches from study design
    session.setDrawerStatus(projectDetailsStore.drawerStatus);

    //clear project details when user switches between menu unless the user is clicks back to projects from analytics page
    if (location.indexOf("/analytics") === -1 && title !== MENU_ITEMS.ANALYTICS.PROJECT) {
        projectDetailsStore.resetProject();
    }
};

const GetMainMenu = props => {
    const [open, setOpen] = React.useState(false);
    const { type, subType } = props;

    const options = MENU[type][subType];
    const isMainMenuOpen = session.open;

    const classes = useStyles();

    const location = useLocation();
    const theme = useTheme();

    const pallete = {
        dark: {
            backgroundColor: "#333333",
            border: "1px solid rgba(255, 255, 255, 0.12)",
        },
        light: {
            backgroundColor: "#f2f2f2",
            border: "1px solid rgba(0, 0, 0, 0.12)",
        },
        custom: {
            tooltipBgColor: theme.palette.background.paper,
            tooltipTextColor: theme.palette.getContrastText(theme.palette.background.paper),
        },
    };

    const mode = theme.palette.mode;

    const showHelpMenu = subType === MENU_ITEMS.MAIN.DOCUMENTATION;

    const hasSubMenuItems =
        options.length > 0 && options[0]?.subMenuItems && options[0]?.subMenuItems?.length > 0;

    const handleMenuOpen = status => {
        //Save drawer status in project store. This will be used to force minimize menu while designing study and to restore menu to its previous state.
        projectDetailsStore.saveMenuStatus(status);

        if (open === status) {
            return;
        }

        setOpen(status);
        if (status === true) {
            session.setDrawerStatus(status);
        }
    };

    const showAdmin = session.isAdmin || session.isModerator;
    const showCodeBuilder = session.isAdmin || session.hasCodeBuilderAccess;

    if (subType === MENU_ITEMS.MAIN.ADMIN && !showAdmin) {
        return <span />;
    }

    if (subType === MENU_ITEMS.MAIN.CODEBUILDER && !showCodeBuilder) {
        return <span />;
    }

    return options.map(option => {
        const { icon, title, to, subMenuItems } = option;

        const selected = hasSubMenuItems
            ? location.pathname?.startsWith(to)
            : location.pathname === to;

        return (
            <List component="nav" aria-label="main menu" sx={{ padding: "4px 0" }} key={title + to}>
                {/* Show submenu inside tooltip and show title for others when the menu is in minimized state. */}
                {/* No need to show tooltip when menu is expanded since we can see title. */}
                <Tooltip
                    title={
                        !isMainMenuOpen ? (
                            <DisplayPopOverSubMenu
                                data={subMenuItems}
                                showHelpMenu={showHelpMenu}
                                subType={subType}
                                hasSubMenuItems={hasSubMenuItems}
                                title={title}
                            />
                        ) : (
                            ""
                        )
                    }
                    placement="right"
                    disableFocusListener
                    slotProps={{
                        tooltip: {
                            sx: {
                                bgcolor: pallete.custom.tooltipBgColor,
                                color: pallete.custom.tooltipTextColor,
                                border: pallete[mode].border,
                                padding: "4px 0px",
                            },
                        },
                    }}
                >
                    <ListItemButton
                        selected={selected}
                        onClick={() => {
                            handleMenuOpen(true);
                            resetProjectAndRestoreDrawerStatus(title, location.pathname);
                        }}
                        component={Link}
                        to={to}
                        state={{ title: title }}
                        className={classes.link}
                        style={{ flexBasis: "80%", alignItems: "center" }}
                    >
                        <ListItemIcon
                            sx={
                                selected
                                    ? {
                                          color: `${theme.palette.primary.main}`,
                                      }
                                    : {}
                            }
                            style={{ minWidth: "40px" }}
                        >
                            {icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={title}
                            sx={selected ? { color: `${theme.palette.primary.main}` } : {}}
                        />

                        {hasSubMenuItems &&
                            (open ? (
                                <IconButton onClick={() => handleMenuOpen(false)}>
                                    <ExpandLess />
                                </IconButton>
                            ) : (
                                <IconButton onClick={() => handleMenuOpen(true)}>
                                    <ExpandMore />
                                </IconButton>
                            ))}
                    </ListItemButton>
                </Tooltip>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    {open && isMainMenuOpen && hasSubMenuItems && (
                        <GetSubMenuItems
                            data={subMenuItems}
                            showHelpMenu={showHelpMenu}
                            backgroundColor={pallete[mode].backgroundColor}
                            subType={subType}
                        />
                    )}
                </Collapse>
            </List>
        );
    });
};

const DisplayPopOverSubMenu = props => {
    const { hasSubMenuItems, title } = props;

    const theme = useTheme();

    if (!hasSubMenuItems) {
        return <span style={{ padding: "0px 8px" }}>{title}</span>;
    }

    return (
        <div
            style={{
                maxHeight: "400px",
                overflowY: "auto",
                background: theme.palette.background.paper,
            }}
        >
            <GetSubMenuItems {...props} />
        </div>
    );
};

const GetSubMenuItems = props => {
    const { data, showHelpMenu, subType } = props;

    let eligibleData = data;

    if (subType === MENU_ITEMS.MAIN.ADMIN) {
        const moderatorCanAccess = ["Miscellaneous"];
        eligibleData = session.isModerator
            ? data.filter(item => moderatorCanAccess.includes(item.title))
            : data;
    }

    return (
        <List component="nav" aria-label="sub menu" dense={showHelpMenu}>
            {eligibleData.map((value, key) => {
                return SubMenu(value, showHelpMenu, key);
            })}
        </List>
    );
};

const SubMenu = (props, showHelpMenu, key) => {
    const classes = useStyles();
    const { icon, title, to, indent } = props;
    const location = useLocation();
    const selected = location?.pathname === to;
    const theme = useTheme();

    return (
        <ListItemButton
            key={key}
            selected={selected}
            component={Link}
            to={to}
            sx={{
                paddingLeft: "16px", // Reduced padding for more compact look
                paddingY: "4px",
                margin: 0,
                width: "100%",
            }}
            state={{ resource: showHelpMenu && props.resource, title: title }}
            className={classes.link}
            onClick={() => resetProjectAndRestoreDrawerStatus(title, to)}
        >
            <ListItemIcon
                sx={
                    selected
                        ? {
                              color: `${theme.palette.primary.main}`,
                              minWidth: "40px",
                          }
                        : { minWidth: "40px" }
                }
            >
                {icon ? (
                    <ListItemIcon
                        className={classes.indentText}
                        sx={
                            selected
                                ? {
                                      color: `${theme.palette.primary.main}`,
                                      minWidth: "40px",
                                  }
                                : { minWidth: "40px" }
                        }
                    >
                        {icon}
                    </ListItemIcon>
                ) : null}
            </ListItemIcon>
            {indent ? (
                <ListItemText
                    className={classes.indentText}
                    sx={
                        selected
                            ? {
                                  color: `${theme.palette.primary.main}`,
                              }
                            : {}
                    }
                    primary={title}
                />
            ) : (
                <ListItemText
                    primary={title}
                    sx={
                        selected
                            ? {
                                  color: `${theme.palette.primary.main}`,
                              }
                            : {}
                    }
                />
            )}
        </ListItemButton>
    );
};
export default MainMenu;
