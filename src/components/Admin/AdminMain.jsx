import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import GroupIcon from "@mui/icons-material/Group";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import { StorageRounded } from "@mui/icons-material";
import { StudiesMain } from "./Studies/StudiesMain";
import { JobsAddonsMain } from "./AllJobs/Main";
import { AnalyticsMain } from "./Analytics/Index";
// import { AllUsers } from "./Users/Main";
import { Publications } from "./Publications/PublicationsMain";
import { MessageUsers } from "./MessageUsers";
import { ApplicationStatus } from "./ApplicationStatus";
import { TabPanel } from "../Common/TabPanel";
import session from "../../state/store/session";
import { Grid2 as Grid } from "@mui/material";
import { ManageDatabases } from "./ManageDatabases";
import { adminServiceUsersTableHeader, adminStudiesTableHeader } from "../../constants";
import { ServiceUsers } from "./ServiceUsers";
import { ToggleDesign } from "./ToggleDesign";

const ACTIVE_TAB = 0;

function a11yProps(index) {
    return {
        id: `scrollable-force-tab-${index}`,
        "aria-controls": `scrollable-force-tabpanel-${index}`,
    };
}

const useStyles = makeStyles(() => ({
    root: { flexGrow: 1, width: "100%" },
    indicator: { display: "none" },
    selected: { borderBottom: "2px solid #1976d2" },
}));

const Admin = () => {
    const classes = useStyles();

    const [value, setValue] = React.useState(ACTIVE_TAB);

    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

    const show = session.isModerator || session.isAdmin;

    return (
        <div className={classes.root}>
            {show && (
                <>
                    <AppBar
                        sx={{ backgroundColor: "background.paper" }}
                        position="static"
                        enableColorOnDark
                    >
                        <Tabs
                            value={value}
                            centered
                            onChange={handleChange}
                            //   variant="scrollable"
                            scrollButtons
                            indicatorColor="primary"
                            textColor="primary"
                            aria-label="scrollable force tabs example"
                            allowScrollButtonsMobile
                            classes={{ indicator: classes.indicator }}
                        >
                            <Tab
                                label={adminStudiesTableHeader}
                                icon={<AccountTreeIcon />}
                                {...a11yProps(0)}
                                classes={{ selected: classes.selected }}
                            />
                            <Tab
                                label="Jobs/AddOns"
                                icon={<AccountTreeIcon />}
                                {...a11yProps(0)}
                                classes={{ selected: classes.selected }}
                            />
                            <Tab
                                label="Analytics"
                                icon={<AccountTreeIcon />}
                                {...a11yProps(1)}
                                classes={{ selected: classes.selected }}
                            />
                            {session.isAdmin ? (
                                <Tab
                                    label="Publications"
                                    icon={<LocalLibraryIcon />}
                                    {...a11yProps(2)}
                                    classes={{ selected: classes.selected }}
                                />
                            ) : null}
                            {session.isAdmin ? (
                                <Tab
                                    label="Broadcast"
                                    icon={<AddAlertIcon />}
                                    {...a11yProps(3)}
                                    classes={{ selected: classes.selected }}
                                />
                            ) : null}
                            {session.isAdmin ? (
                                <Tab
                                    label="Manage Databases"
                                    icon={<StorageRounded />}
                                    {...a11yProps(0)}
                                    classes={{ selected: classes.selected }}
                                />
                            ) : null}
                            {session.isAdmin ? (
                                <Tab
                                    label={adminServiceUsersTableHeader}
                                    icon={<GroupIcon />}
                                    {...a11yProps(4)}
                                    classes={{ selected: classes.selected }}
                                />
                            ) : null}
                            {session.isAdmin ? (
                                <Tab
                                    label="Dexter Status"
                                    icon={<DesktopWindowsIcon />}
                                    {...a11yProps(4)}
                                    classes={{ selected: classes.selected }}
                                />
                            ) : null}
                            {session.isAdmin ? (
                                <Tab
                                    label="Toggle Design"
                                    icon={<DesktopWindowsIcon />}
                                    {...a11yProps(4)}
                                    classes={{ selected: classes.selected }}
                                />
                            ) : null}
                        </Tabs>
                    </AppBar>
                    <Grid container justifyContent={"center"}>
                        <Grid size={{ xs: 12, md: 11, lg: 11, xl: 10 }}>
                            <Grid container>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <TabPanel value={value} index={0}>
                                        <StudiesMain />
                                    </TabPanel>
                                    <TabPanel value={value} index={1}>
                                        <JobsAddonsMain />
                                    </TabPanel>
                                    <TabPanel value={value} index={2}>
                                        <AnalyticsMain />
                                    </TabPanel>
                                    {session.isAdmin && (
                                        <TabPanel value={value} index={3}>
                                            <Publications />
                                        </TabPanel>
                                    )}
                                    {session.isAdmin && (
                                        <TabPanel value={value} index={4}>
                                            <MessageUsers />
                                        </TabPanel>
                                    )}

                                    {session.isAdmin ? (
                                        <TabPanel value={value} index={5}>
                                            <ManageDatabases />
                                        </TabPanel>
                                    ) : null}

                                    {session.isAdmin ? (
                                        <TabPanel value={value} index={6}>
                                            <ServiceUsers />
                                        </TabPanel>
                                    ) : null}

                                    {session.isAdmin ? (
                                        <TabPanel value={value} index={7}>
                                            <ApplicationStatus />
                                        </TabPanel>
                                    ) : null}
                                    {session.isAdmin ? (
                                        <TabPanel value={value} index={8}>
                                            <ToggleDesign />
                                        </TabPanel>
                                    ) : null}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </>
            )}
        </div>
    );
};

export default Admin;
