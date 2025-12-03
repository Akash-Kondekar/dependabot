import React from "react";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";

import Tooltip from "@mui/material/Tooltip";
import { Link, useLocation } from "react-router-dom";
import { Box, ListItemButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import session from "../../state/store/session";
import projectDetailsStore from "../../state/store/projects/details";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import NoteAddIcon from "@mui/icons-material/NoteAddOutlined";
import VaccinesIcon from "@mui/icons-material/VaccinesOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import LeaderboardIcon from "@mui/icons-material/LeaderboardOutlined";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import AssignmentIndIcon from "@mui/icons-material/BusinessCenterOutlined";
import ArticleIcon from "@mui/icons-material/ArticleOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalanceOutlined";
import Apps from "@mui/icons-material/AppsOutlined";
import ArrowCircleLeft from "@mui/icons-material/ArrowCircleLeftOutlined";
import Description from "@mui/icons-material/DescriptionOutlined";
import ManageAccounts from "@mui/icons-material/ManageAccountsOutlined";
import People from "@mui/icons-material/PeopleOutlined";
import QueryStats from "@mui/icons-material/QueryStatsOutlined";
import Widgets from "@mui/icons-material/WidgetsOutlined";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import RateReviewIcon from "@mui/icons-material/RateReviewOutlined";
import AddCircle from "@mui/icons-material/AddCircleRounded";

import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import { BasicButton } from "../Common/BasicButton.jsx";
import { CREATE_A_NEW_STUDY } from "../../constants/index.jsx";
import CreateNewStudyDialog from "../Study/CreateNewStudyDialog.jsx";

export const MENU = {
    MAIN: {
        PRIMARY: "Primary",
        CODEBUILDER: "Phenotype Library",
        DOCUMENTATION: "Documentation",
        ADMIN: "Admin",
        FEEDBACK: "Feedback",
    },
    ANALYTICS: {
        DASHBOARD: "Dashboard",
        DATA_EXTRACTION: "Data Extraction Report",
        SUMMARY: "Summary",
        ANALYSIS: "Analysis",
        PROJECT: "Back to Project",
    },
};

const MENU_ITEMS = {
    MAIN: {
        [MENU.MAIN.PRIMARY]: [
            {
                to: "/home/new",
                icon: <DashboardIcon />,
                title: "Dashboard",
                subMenuItems: [],
                disabled: false,
            },
            {
                to: "/projects/new",
                icon: <AssignmentIndIcon />,
                title: "My Projects",
                subMenuItems: [],
                disabled: false,
            },
            {
                to: "/studyprotocols",
                icon: <ArticleIcon />,
                title: "Study Protocols",
                subMenuItems: [],
                disabled: false,
            },
        ],
        [MENU.MAIN.ADMIN]: [
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
                        disabled: true,
                    },
                    {
                        to: "/admin/user",
                        icon: <People />,
                        title: "Users",
                        indent: false,
                        disabled: true,
                    },
                    {
                        to: "/admin/miscellaneous",
                        icon: <Widgets />,
                        title: "Miscellaneous",
                        indent: false,
                        disabled: true,
                    },
                ],
                disabled: true,
            },
        ],
        [MENU.MAIN.CODEBUILDER]: [
            {
                to: "/builder",
                icon: <AccountBalanceIcon />,
                title: "Phenotype Library",
                disabled: true,
            },
            {
                to: "/builder/medical",
                icon: <NoteAddIcon />,
                title: "Create Medical codes",
                disabled: true,
            },
            {
                to: "/builder/drugs",
                icon: <VaccinesIcon />,
                title: "Create Drug codes",
                disabled: true,
            },
        ],

        [MENU.MAIN.DOCUMENTATION]: [
            {
                to: "/help",
                title: "Documentation",
                indent: false,
                icon: <MenuBookOutlinedIcon />,
                disabled: true,
                subMenuItems: [
                    {
                        resource: "governance",
                        title: "Governance",
                        indent: false,
                        to: "/help/governance",
                        disabled: true,
                    },
                    {
                        resource: "mydatabases",
                        title: "My Databases",
                        indent: false,
                        to: "/help/mydatabases",
                        disabled: true,
                    },
                    {
                        resource: "projects",
                        title: "Projects",
                        indent: false,
                        to: "/help/projects",
                        disabled: true,
                    },
                    {
                        resource: "codebuilder",
                        title: "Phenotype library",
                        indent: false,
                        to: "/help/phenotypelibrary",
                        disabled: true,
                    },
                    {
                        resource: "studyprotocols",
                        title: "Study Protocols",
                        indent: false,
                        to: "/help/studyprotocols",
                        disabled: true,
                    },
                    {
                        resource: "studydesigns",
                        title: "Study Designs",
                        indent: false,
                        to: "/help/designs",
                        disabled: true,
                    },
                    {
                        resource: "studyperiod",
                        title: "Study Period",
                        indent: true,
                        to: "/help/designs/studyperiod",
                        disabled: true,
                    },
                    {
                        resource: "exposed",
                        title: "Exposure",
                        indent: true,
                        to: "/help/designs/exposure",
                        disabled: true,
                    },
                    {
                        resource: "controlandmatching",
                        title: "Controls and matching",
                        indent: true,
                        to: "/help/designs/controlandmatch",
                        disabled: true,
                    },
                    {
                        resource: "baseline",
                        title: "Baseline",
                        indent: true,
                        to: "/help/designs/baseline",
                        disabled: true,
                    },
                    {
                        resource: "outcome",
                        title: "Outcome",
                        indent: true,
                        to: "/help/designs/outcome",
                        disabled: true,
                    },
                    {
                        resource: "addvariables",
                        title: "ADD VARIABLES",
                        indent: true,
                        to: "/help/designs/addvariables",
                        disabled: true,
                    },
                    {
                        resource: "extractedDatasets",
                        title: "Extracted data",
                        indent: false,
                        to: "/help/extracteddata",
                        disabled: true,
                    },
                    {
                        resource: "addons",
                        title: "Additional data (Addons)",
                        indent: false,
                        to: "/help/addons",
                        disabled: true,
                    },
                    {
                        resource: "analytics",
                        title: "Analytics",
                        indent: false,
                        to: "/help/results",
                        disabled: true,
                    },
                    {
                        resource: "cite",
                        title: "Cite Dexter",
                        indent: false,
                        to: "/help/cite",
                        disabled: true,
                    },
                    {
                        resource: "privacyPolicy",
                        title: "Privacy Policy",
                        indent: false,
                        to: "/help/privacy",
                        disabled: true,
                    },
                    {
                        resource: "cookiePolicy",
                        title: "Cookie Policy",
                        indent: false,
                        to: "/help/cookies",
                        disabled: true,
                    },
                ],
            },
        ],
        [MENU.MAIN.FEEDBACK]: [
            {
                to: "/feedback",
                icon: <RateReviewIcon />,
                title: "Feedback",
                subMenuItems: [],
                disabled: true,
            },
        ],
    },
    ANALYTICS: {
        [MENU.ANALYTICS.DASHBOARD]: [
            {
                to: "/analytics/home",
                title: "Dashboard",
                indent: false,
                icon: <DashboardIcon />,
                subMenuItems: [],
                disabled: true,
            },
        ],
        [MENU.ANALYTICS.DATA_EXTRACTION]: [
            {
                to: "/analytics/dataextractionreport",
                title: "Data Extraction Report",
                indent: false,
                icon: <Description />,
                subMenuItems: [],
                disabled: true,
            },
        ],
        [MENU.ANALYTICS.SUMMARY]: [
            {
                to: "/analytics/summary",
                title: "Summary",
                indent: false,
                icon: <LeaderboardIcon />,
                subMenuItems: [],
                disabled: true,
            },
        ],
        [MENU.ANALYTICS.ANALYSIS]: [
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
                        disabled: true,
                    },
                    {
                        to: "/analytics/analysis/subgroup",
                        title: "Subgroup",
                        indent: false,
                        icon: <Apps />,
                        disabled: true,
                    },
                ],
                disabled: true,
            },
        ],
        [MENU.ANALYTICS.PROJECT]: [
            {
                to: "/projects",
                title: MENU.ANALYTICS.PROJECT,
                indent: false,
                icon: <ArrowCircleLeft />,
                subMenuItems: [],
                disabled: true,
            },
        ],
    },
};

const resetProjectAndRestoreDrawerStatus = (title, location) => {
    //Restore drawer status to its previous state (expanded or minimized) when user switches from study design
    session.setDrawerStatus(projectDetailsStore.drawerStatus);

    //clear project details when user switches between menu unless the user is clicks back to projects from analytics page
    if (location.indexOf("/analytics") === -1 && title !== MENU.ANALYTICS.PROJECT) {
        projectDetailsStore.resetProject();
    }
};

const MainMenuItems = props => {
    const { type } = props;
    const data = MENU[type];
    const [openCreateNewStudyDialog, setOpenCreateNewStudyDialog] = React.useState(false);

    return (
        <Box>
            {Object.keys(data).map(option => {
                return (
                    <span key={option}>
                        <GetMainMenu type={type} subType={data[option]} />
                    </span>
                );
            })}

            {session.open ? (
                <BasicButton
                    buttonText={CREATE_A_NEW_STUDY}
                    variant="outlined"
                    sx={{
                        marginTop: "30px",
                        marginLeft: "15px",
                        borderRadius: "30px",
                        textTransform: "capitalize",
                    }}
                    handleClick={() => setOpenCreateNewStudyDialog(true)}
                    startIcon={<AddCircle />}
                />
            ) : (
                <Tooltip title={CREATE_A_NEW_STUDY}>
                    <IconButton
                        aria-label={CREATE_A_NEW_STUDY}
                        sx={{
                            marginTop: "30px",
                            marginLeft: "5px",
                            borderRadius: "30px",
                        }}
                        onClick={() => setOpenCreateNewStudyDialog(true)}
                    >
                        <AddCircle />
                    </IconButton>
                </Tooltip>
            )}
            {openCreateNewStudyDialog && (
                <CreateNewStudyDialog
                    open={openCreateNewStudyDialog}
                    setOpen={setOpenCreateNewStudyDialog}
                />
            )}
        </Box>
    );
};

const GetMainMenu = props => {
    const [open, setOpen] = React.useState(false);
    const { type, subType } = props;

    const options = MENU_ITEMS[type][subType];
    const isMainMenuOpen = session.open;

    const location = useLocation();
    const theme = useTheme();
    const showHelpMenu = subType === MENU.MAIN.DOCUMENTATION;
    const mode = theme.palette.mode;

    const hasSubMenuItems =
        options.length > 0 && options[0]?.subMenuItems && options[0]?.subMenuItems?.length > 0;

    const palette = {
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

    const showAdminMenu = session.isAdmin || session.isModerator;
    const showCodeBuilder = session.isAdmin || session.hasCodeBuilderAccess;

    if (subType === MENU.MAIN.ADMIN && !showAdminMenu) {
        return <span />;
    }

    if (subType === MENU.MAIN.CODEBUILDER && !showCodeBuilder) {
        return <span />;
    }

    return options?.map(option => {
        const { icon, title, to, subMenu, disabled } = option;

        //TODO: need to replace exact matching with startwith matching so that top level menu keep highlighting when sub routes are selected
        //const selected = to.startsWith(location.pathname);
        const selected = location.pathname === to;

        return (
            <List
                component="nav"
                aria-label="main menu"
                sx={{
                    padding: "4px 0",
                }}
                key={title + to}
            >
                {/* Show submenu inside tooltip and show title for others when the menu is in minimized state. */}
                {/* No need to show tooltip when menu is expanded since we can see title. */}
                <Tooltip
                    title={
                        !isMainMenuOpen ? (
                            <DisplayPopOverSubMenu
                                data={subMenu}
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
                                bgcolor: palette.custom.tooltipBgColor,
                                color: palette.custom.tooltipTextColor,
                                border: palette[mode].border,
                                padding: "4px 0px",
                            },
                        },
                    }}
                >
                    <ListItemButton
                        selected={selected}
                        onClick={
                            disabled
                                ? e => e.preventDefault()
                                : () => {
                                      handleMenuOpen(true);
                                      resetProjectAndRestoreDrawerStatus(title, location.pathname);
                                  }
                        }
                        component={disabled ? "div" : Link}
                        to={disabled ? undefined : to}
                        state={disabled ? undefined : { title: title }}
                        sx={{
                            flexBasis: "80%",
                            alignItems: "center",
                            pointerEvents: disabled ? "none" : "auto",
                            opacity: disabled ? 0.5 : 1,
                            cursor: disabled ? "default" : "pointer",
                        }}
                        disabled={disabled}
                        style={{
                            flexBasis: "80%",
                            alignItems: "center",
                            borderLeft: selected && `4px solid ${theme.palette.primary.main}`,
                            paddingLeft: selected && "12px",
                        }}
                    >
                        <ListItemIcon
                            sx={
                                selected
                                    ? {
                                          color: `${theme.palette.primary.dark}`,
                                      }
                                    : {}
                            }
                            style={{ minWidth: "40px" }}
                            aria-label={`${title}-icon`}
                        >
                            {icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={title}
                            sx={selected ? { color: `${theme.palette.primary.dark}` } : {}}
                        />
                        {hasSubMenuItems &&
                            (open ? (
                                <IconButton
                                    onClick={() => handleMenuOpen(false)}
                                    aria-label="collapse-menu"
                                >
                                    <ExpandLess />
                                </IconButton>
                            ) : (
                                <IconButton
                                    onClick={() => handleMenuOpen(true)}
                                    aria-label="expand-menu"
                                >
                                    <ExpandMore />
                                </IconButton>
                            ))}
                    </ListItemButton>
                </Tooltip>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    {open && isMainMenuOpen && hasSubMenuItems && (
                        <GetSubMenuItems
                            data={subMenu}
                            showHelpMenu={showHelpMenu}
                            backgroundColor={palette[mode].backgroundColor}
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

    if (subType === MENU.MAIN.ADMIN) {
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
    const { icon, title, to, indent, disabled } = props;
    const location = useLocation();
    const selected = location?.pathname === to;
    const theme = useTheme();

    return (
        <ListItemButton
            key={key}
            selected={selected}
            component={disabled ? "div" : Link}
            to={disabled ? undefined : to}
            state={
                disabled ? undefined : { resource: showHelpMenu && props.resource, title: title }
            }
            sx={{
                paddingLeft: "16px", // Reduced padding for more compact look
                paddingY: "4px",
                margin: 0,
                width: "100%",
                pointerEvents: disabled ? "none" : "auto",
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "default" : "pointer",
            }}
            onClick={
                disabled
                    ? e => e.preventDefault()
                    : () => {
                          resetProjectAndRestoreDrawerStatus(title, to);
                      }
            }
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

export default MainMenuItems;
