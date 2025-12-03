import React from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import makeStyles from "@mui/styles/makeStyles";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";

import { useTheme } from "@mui/material/styles";

import broadcast from "../../state/store/admin/broadcast";
import dashboardStore from "../../state/store/dashboard";
import user from "../../state/store/user";
import clientList from "../../state/store/admin/clients/list";
import { observer } from "mobx-react";
import { formatDate, formatDateTime, getUserFriendlyTime } from "../../utils/index.jsx";
import {
    DATE_TIME_FORMAT,
    GetIconForThisStatus,
    TRIAL_RUN_STUDY_TEXT,
} from "../../constants/index.jsx";
import session from "../../state/store/session";
import jobStatus from "../../state/store/study/job-status";
import events from "../../lib/events";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { DisplayAvatar, NoData } from "../Common";
import { Divider, LinearProgress, Tooltip } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Link } from "react-router-dom";
import projectDetails from "../../state/store/projects/details";
import IconButton from "@mui/material/IconButton";
import WarningIcon from "@mui/icons-material/Warning";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CloseIcon from "@mui/icons-material/Close";
import differenceInCalendarDays from "date-fns/differenceInDays";
import { HighlightOff, TaskAlt } from "@mui/icons-material";
import { grey } from "@mui/material/colors";

const severityName = { 1: "High", 2: "Medium", 3: "Low" };

const ellipses = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
};

const outline = {
    borderRadius: "10px",
    overflow: "auto",
    padding: "10px",
};

const useLocalStyles = makeStyles(theme => ({
    container: {
        width: "500px",
        padding: "10px",
        margin: "0 auto",
    },
    message: {
        marginTop: "10px",
    },
    subText: {
        marginTop: "10px",
        marginBottom: "10px",
    },
    header: {
        textDecoration: "none",
        textAlign: "center",
    },
    subHeader: {
        textDecoration: "none",
        textAlign: "left",
        fontSize: "1.2rem",
    },
    link: {
        textDecoration: "underline",
        color: theme.palette.text.primary,
    },
    root: {
        margin: "10px",
        backgroundColor: theme.palette.background.paper,
    },
    messages: { ...outline, border: `1px solid ${grey["500"]}` },
    inline: {
        display: "inline",
        marginLeft: "20px",
        marginTop: "5px",
        overflowWrap: "break-word", //Wrap the sentence to next line if there is an overflow
    },
    box: {
        margin: "20px 0px 20px 0px ",
    },
    dashboard: {
        margin: "10px",
        padding: "10px",
    },
    dashboardColumn: {
        marginBottom: "3px",
        width: "20%",
    },
    showEllipses: {
        ...ellipses,
    },
    cardHeader: {
        color: "#2A2A2A",
        lineHeight: "40px",
        fontWeight: "400",
    },
    cardHeightAndBorder: {
        maxHeight: "62vh",
        height: "100%",
        ...outline,
        border: `1px solid ${grey["500"]}`,
    },
    columnStyle: {
        display: "flex",
        borderBottom: `1px solid ${grey["500"]}`,
        marginTop: "18px",
    },
    rowStyle: {
        display: "flex",
        marginTop: "5px",
        alignItems: "center",
    },
    gridLayout: {
        maxHeight: "62vh",
        height: "100%",
        ...outline,
        border: `1px solid ${grey["500"]}`,
    },
    jobsDisabled: {
        width: "fit-content",
        margin: "20px 0px 20px 0px",
    },
    userExpiration: {
        width: "fit-content",
        margin: "20px 0px 20px 0px",
    },
    gridColumn: {
        marginBottom: "3px",
        ...ellipses,
    },
    textColor: {
        fontSize: "medium",
    },
    block: {
        display: "block",
        marginTop: "5px",
        overflowWrap: "break-word", //Wrap the sentence to next line if there is an overflow
    },
    alert: {
        margin: "20px 0px 20px 0px",
        borderRadius: "10px",
    },
    expirePanel: {
        border: `1px solid ${grey["500"]}`,
        borderRadius: "10px",
        overflow: "auto",
        marginBottom: "20px",
    },
}));

const setProject = (id, name) => {
    const project = {
        projectID: id,
        projectName: name,
    };
    projectDetails.setProject(project);
};

const Column = observer(({ name, width, padding = 0 }) => {
    const classes = useLocalStyles();
    return (
        <div
            style={{
                width: width,
                padding: padding,
            }}
            className={classes.gridColumn}
        >
            <span className={classes.textColor}>{name}</span>
        </div>
    );
});

const Data = observer(({ value, width, tooltip = value }) => {
    const classes = useLocalStyles();
    return (
        <div
            style={{
                width: width,
            }}
            className={classes.showEllipses}
        >
            {tooltip ? (
                <Tooltip title={tooltip}>
                    <span className={classes.textColor}>{value}</span>
                </Tooltip>
            ) : (
                <span className={classes.textColor}>{value}</span>
            )}
        </div>
    );
});

const UserActivities = observer(() => {
    const classes = useLocalStyles();

    if (dashboardStore.busy || !dashboardStore.data?.userActivities) {
        return;
    }

    return (
        <Grid size={6}>
            <div className={classes.gridLayout}>
                <Typography component="span" variant="h6" color="textPrimary">
                    My Activity
                </Typography>

                {dashboardStore.data?.userActivities?.length === 0 ? (
                    <NoData message="No Activities Found" />
                ) : (
                    <>
                        <div className={classes.columnStyle}>
                            <Column name="Name" width="45%" />
                            <Column name="Project" width="40%" />
                            <Column name="Info" width="15%" padding="0 0 0 10px" />
                        </div>

                        {dashboardStore.data?.userActivities?.map(activity => {
                            const key = activity.jobID + activity.jobName + activity.submittedOn;

                            return (
                                <div key={key} className={classes.rowStyle}>
                                    <Data width="45%" value={activity.jobName} />
                                    <Data
                                        width="40%"
                                        value={
                                            <Link
                                                to="/projects"
                                                state={{ title: "My Projects" }}
                                                onClick={() =>
                                                    setProject(
                                                        activity.projectID,
                                                        activity.projectName
                                                    )
                                                }
                                                className={classes.link}
                                            >
                                                {activity.projectName}
                                            </Link>
                                        }
                                        tooltip={activity.projectName}
                                    />
                                    <Stack
                                        direction="row"
                                        sx={{
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <GetIconForThisStatus desc={activity.statusDescription} />
                                        <Tooltip
                                            title={`${
                                                activity.jobName.startsWith("AVF")
                                                    ? "Addon Created On: "
                                                    : "Job Created On: "
                                            } ${formatDate(activity.submittedOn)}`}
                                        >
                                            <IconButton style={{ cursor: "default" }}>
                                                <CalendarMonthIcon
                                                    sx={{ verticalAlign: "middle" }}
                                                />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </Grid>
    );
});

const TeamActivities = observer(() => {
    const classes = useLocalStyles();

    if (dashboardStore.busy || !dashboardStore.data?.projectActivities) {
        return;
    }

    return (
        <Grid size={6}>
            <div className={classes.gridLayout}>
                <Typography component="span" variant="h6" color="textPrimary">
                    {"Team's Activity"}
                </Typography>

                {dashboardStore.data?.projectActivities?.length === 0 ? (
                    <NoData message="No Activities Found" />
                ) : (
                    <>
                        <div className={classes.columnStyle}>
                            <Column name="Name" width="40%" />
                            <Column name="Project" width="35%" />
                            <Column name="Info" width="25%" padding="0 0 0 10px" />
                        </div>

                        {dashboardStore.data?.projectActivities?.map(activity => {
                            const key = activity.jobID + activity.submittedOn;
                            return (
                                <div key={key} className={classes.rowStyle}>
                                    <Data width="40%" value={activity.jobName} />
                                    <Data
                                        width="35%"
                                        value={
                                            <Link
                                                to="/projects"
                                                state={{ title: "My Projects" }}
                                                onClick={() =>
                                                    setProject(
                                                        activity.projectID,
                                                        activity.projectName
                                                    )
                                                }
                                                className={classes.link}
                                            >
                                                {activity.projectName}
                                            </Link>
                                        }
                                        tooltip={activity.projectName}
                                    />
                                    <Stack
                                        direction="row"
                                        sx={{
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <GetIconForThisStatus desc={activity.statusDescription} />
                                        <Tooltip title={activity.submittedByUserFullName}>
                                            <IconButton style={{ cursor: "default" }}>
                                                <DisplayAvatar
                                                    value={activity.submittedByUserFullName}
                                                    size="small"
                                                    randomColor={true}
                                                    fontSize="0.75rem"
                                                />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip
                                            title={`${
                                                activity.jobName.startsWith("AVF")
                                                    ? "Addon Created On: "
                                                    : "Job Created On: "
                                            } ${formatDate(activity.submittedOn)}`}
                                        >
                                            <IconButton style={{ cursor: "default" }}>
                                                <CalendarMonthIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </Grid>
    );
});

const getExpiryDateString = date => {
    if (date === null) return null;
    const now = new Date();
    const diffInDays = differenceInCalendarDays(
        new Date(date).getTime(),
        new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    );
    if (diffInDays > 30) {
        return null;
    }
    let abbr = "in " + diffInDays + " days";
    if (diffInDays === 1) {
        abbr = "tomorrow";
    }
    if (diffInDays === 0) {
        abbr = "today";
    }
    if (diffInDays >= 7) {
        abbr = "in " + Math.floor(diffInDays / 7) + " week(s)";
    }
    return abbr;
};

const UserExpireAlert = observer(() => {
    const classes = useLocalStyles();
    const systemTheme = useTheme();
    const displayAlert = user.isActiveClient && user.clientHasName;
    if (displayAlert) {
        const expiryDateString = getExpiryDateString(user.clientDetails?.clientEndDate);
        if (expiryDateString === null) return;
        return (
            <Grid size={12}>
                <Grid container spacing={2}>
                    <Grid
                        size={{
                            xs: 12,
                            lg: 10,
                            xl: 6,
                        }}
                    >
                        <Alert
                            className={classes.alert}
                            severity="warning"
                            variant={systemTheme.palette.mode === "dark" ? "outlined" : "standard"}
                            onClose={() => {
                                dashboardStore.setAlertClosed(true);
                            }}
                        >
                            <AlertTitle>Expiring Client</AlertTitle>
                            <Typography>
                                Client {user.clientDetails?.clientName} expires {expiryDateString}{" "}
                                on <b>{user.clientDetails?.clientEndDate}</b>
                                <br />
                                Please contact{" "}
                                <a
                                    href="mailto:support@dexter.software"
                                    style={{ color: "inherit" }}
                                >
                                    support@dexter.software
                                </a>{" "}
                                for further assistance.
                            </Typography>
                        </Alert>
                    </Grid>
                </Grid>
            </Grid>
        );
    } else {
        return;
    }
});

const AdminClientExpireList = observer(() => {
    const classes = useLocalStyles();
    const [showMore, setShowMore] = React.useState(false);
    const [expiringClientList, setExpiringClientList] = React.useState([]);
    const currentTheme = useTheme();

    const MAX_VISIBLE_ITEM = 5;

    React.useEffect(() => {
        if (clientList.allActiveClients.length !== 0 && expiringClientList.length === 0) {
            const expClients = clientList.allActiveClients
                ?.sort((c1, c2) => {
                    return c1.endDate > c2.endDate ? 1 : -1;
                })
                .filter(client => getExpiryDateString(client.endDate) !== null);
            setExpiringClientList(expClients);
        }
    }, [clientList.allActiveClients]);
    if (expiringClientList.length === 0) return;
    return (
        <Grid
            size={{
                xs: 12,
                xl: 9,
            }}
        >
            <div className={classes.expirePanel} style={{ maxHeight: "35vh", minHeight: "200px" }}>
                <div
                    style={{
                        width: "100%",
                        padding: "10px 20px 10px 20px",
                        backgroundColor: currentTheme.palette.action.disabledBackground,
                        position: "relative",
                    }}
                >
                    <IconButton
                        onClick={() => {
                            dashboardStore.setAlertClosed(true);
                        }}
                        style={{ position: "absolute", top: "10px", right: "10px" }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography
                        component="div"
                        variant="h6"
                        color="textPrimary"
                        style={{ margin: "10px" }}
                    >
                        <WarningAmberRoundedIcon
                            sx={{ verticalAlign: "text-top" }}
                            color="warning"
                        />{" "}
                        Expiring Clients
                    </Typography>
                </div>
                <List style={{ margin: "20px" }}>
                    {expiringClientList
                        .slice(0, showMore ? expiringClientList.length : MAX_VISIBLE_ITEM)
                        .map(client => {
                            return (
                                <div key={client.id}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            marginBottom: "10px",
                                            marginX: "10px",
                                        }}
                                    >
                                        <Grid container spacing={2}>
                                            <Grid
                                                size={{
                                                    xs: 7,
                                                    lg: 8,
                                                }}
                                            >
                                                <Typography style={{ margin: "20px" }}>
                                                    Client {client.name}{" "}
                                                    <span style={{ color: "red" }}>
                                                        expires{" "}
                                                        {getExpiryDateString(client.endDate)}
                                                    </span>
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                size={{
                                                    xs: 5,
                                                    lg: 4,
                                                }}
                                            >
                                                <div style={{ textAlign: "end", margin: "20px" }}>
                                                    <Typography display="inline">
                                                        <b>End Date</b>{" "}
                                                    </Typography>
                                                    <Typography
                                                        display="inline"
                                                        color="textSecondary"
                                                    >
                                                        {client.endDate}
                                                    </Typography>
                                                </div>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </div>
                            );
                        })}
                    {expiringClientList.length > MAX_VISIBLE_ITEM && (
                        <div style={{ textAlign: "end", marginRight: "10px" }}>
                            <Link
                                style={
                                    currentTheme.palette.mode === "dark"
                                        ? { color: "LightBlue" }
                                        : {}
                                }
                                onClick={() => setShowMore(!showMore)}
                            >
                                {showMore ? "Show less..." : "Show more..."}
                            </Link>
                        </div>
                    )}
                </List>
            </div>
        </Grid>
    );
});

const Dashboard = observer(() => {
    const classes = useLocalStyles();
    const nonAdminUser = !session.isAdmin;
    const alertClosed = dashboardStore.expiredAlertClosed;

    const getDashboardData = async () => {
        const getUserClientDetails = async () => {
            !user.clientDetailsFetched && (await user.getClientDetails());
        };
        const getAdminClientsDetails = async () => {
            !clientList.allClientDetailsFetched && (await clientList.loadAllClients());
        };

        if (!alertClosed) {
            if (nonAdminUser) {
                getUserClientDetails();
            } else {
                getAdminClientsDetails();
            }
        }

        (async () => {
            if (nonAdminUser) {
                await dashboardStore.load();
            }
            await broadcast.load();
        })();

        await jobStatus.getExtractionServiceStatus();
        await jobStatus.getJobQueueStatus();
    };

    React.useEffect(() => {
        getDashboardData();
    }, []);

    return (
        <div className={classes.dashboard}>
            <Grid container justifyContent={"center"}>
                <Grid
                    size={{
                        xs: 12,
                        md: 11,
                        lg: 11,
                        xl: 10,
                    }}
                >
                    <Greeting />
                    <JobDisabled />
                    {nonAdminUser && (
                        <Grid
                            container
                            spacing={2}
                            style={{ marginBottom: "20px", marginTop: "20px" }}
                        >
                            <ExtractionStatus />
                        </Grid>
                    )}
                    {!nonAdminUser && (
                        <Grid container spacing={2} style={{ marginTop: "20px" }}>
                            {!alertClosed && <AdminClientExpireList />}
                        </Grid>
                    )}

                    {!nonAdminUser && (
                        <Grid container spacing={2}>
                            <AdminExtractionServiceStatus />
                            {jobStatus?.extractionTelemetryList?.length > 0 && (
                                <CurrentAllocations />
                            )}
                            {jobStatus?.extractionTelemetryList?.length > 0 && (
                                <AdminExtractionStatus />
                            )}
                        </Grid>
                    )}

                    {nonAdminUser && (
                        <Grid container spacing={2}>
                            {!alertClosed && <UserExpireAlert />}
                            <UserActivities setProject={setProject} />
                            <TeamActivities setProject={setProject} />
                        </Grid>
                    )}

                    <div className={classes.box}>
                        <DisplayMessages />
                    </div>
                </Grid>
            </Grid>
        </div>
    );
});

const JobDisabled = observer(() => {
    const [show, setShow] = React.useState(false);
    const classes = useLocalStyles();

    const hideMessage = () => setShow(false);
    const showMessage = () => setShow(true);

    React.useEffect(() => {
        events.on("job.enable", hideMessage);
        events.on("job.disable", showMessage);
    }, []);

    React.useEffect(() => {
        (async () => {
            await jobStatus.checkStatus();
            if (jobStatus.status !== "true") {
                setShow(true);
            }
        })();
    }, []);

    return (
        show && (
            <Alert severity="warning" className={classes.jobsDisabled}>
                Study Submissions are currently disabled by Admin. Please try later.
            </Alert>
        )
    );
});

const Greeting = observer(() => {
    const classes = useLocalStyles();

    return (
        <>
            <Typography component="span" variant="h4" className={classes.header}>
                Hello, {session.loggedInUserFullName}
            </Typography>
            <Typography variant="h6" color="textPrimary" className={classes.subHeader}>
                Welcome to Dexter, Your gateway for Automated Clinical Epidemiology Studies (ACES)
            </Typography>
        </>
    );
});

const ExtractionStatus = observer(() => {
    if (dashboardStore.busy || !dashboardStore.data?.userActivities) {
        return;
    }
    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <Grid
                sx={{
                    maxHeight: "62vh",
                    height: "100%",
                    ...outline,
                    border: `1px solid ${grey["500"]}`,
                }}
            >
                <Grid container justifyContent={"space-between"} margin={"10px"}>
                    <Grid>
                        <Typography component="span" variant="h6" color="textPrimary">
                            Extraction Service Status
                        </Typography>
                    </Grid>
                    <Grid>
                        {
                            <ExtractionServiceStatusIndicator
                                isOn={jobStatus.isExtractionServiceOn}
                            />
                        }
                    </Grid>
                </Grid>

                {jobStatus.isExtractionServiceOn ? (
                    <>
                        <Grid container justifyContent={"space-between"} margin={"10px"}>
                            <Grid>
                                <Typography component="span" variant="h6" color="textPrimary">
                                    Studies Awaiting Extraction
                                </Typography>
                            </Grid>
                            <Grid>
                                <Tooltip
                                    title={
                                        "Total number of jobs: " +
                                        jobStatus.jobQueueStatus.totalJobs
                                    }
                                >
                                    <LinearProgress
                                        variant="determinate"
                                        value={jobStatus.jobQueueStatus.value}
                                        sx={{ width: 200, height: 25, borderRadius: 5 }}
                                        color={jobStatus.jobQueueStatus.color}
                                    />
                                </Tooltip>
                            </Grid>
                        </Grid>
                        <Divider />
                        <Grid container justifyContent={"flex-end"}>
                            <Typography variant="caption" style={{ margin: "10px" }}>
                                Last updated on:{" "}
                                {getUserFriendlyTime(jobStatus.jobQueueStatus.lastUpdated)}
                            </Typography>
                        </Grid>
                    </>
                ) : (
                    <Stack direction="row" spacing={1} margin={"10px"}>
                        <WarningIcon color="warning" />
                        <Typography component="span" variant="body">
                            Unable to provide status for studies awaiting extraction.
                        </Typography>
                    </Stack>
                )}
            </Grid>
        </Grid>
    );
});

const AdminExtractionServiceStatus = observer(() => {
    return (
        <Grid size={6}>
            <Grid
                sx={{
                    maxHeight: "62vh",
                    height: "100%",
                    ...outline,
                    border: `1px solid ${grey["500"]}`,
                }}
            >
                <Typography component="span" variant="h6" color="textPrimary">
                    Extraction Service Status
                </Typography>

                {jobStatus?.serviceUsersStatus?.length === 0 ? (
                    <NoData message="No Extraction Service Found" />
                ) : (
                    <>
                        <Grid
                            sx={{
                                display: "flex",
                                borderBottom: "1px solid #B4B2B2",
                                marginTop: "18px",
                            }}
                        >
                            {" "}
                            <Column name="Service User" width="50%" />
                            <Column name="Status" width="50%" />
                        </Grid>

                        {jobStatus?.serviceUsersStatus?.map(serviceUser => {
                            const key = serviceUser.id;
                            return (
                                <Grid
                                    key={key}
                                    sx={{
                                        display: "flex",
                                        marginTop: "5px",
                                        alignItems: "center",
                                    }}
                                >
                                    <Data width="50%" value={serviceUser.userId} />
                                    <Data
                                        tooltip=""
                                        width="50%"
                                        value={
                                            <ExtractionServiceStatusIndicator
                                                isOn={serviceUser.isServiceUserOn === 1}
                                            />
                                        }
                                    />
                                </Grid>
                            );
                        })}
                    </>
                )}
            </Grid>
        </Grid>
    );
});

const ExtractionServiceStatusIndicator = props => {
    return props?.isOn ? (
        <Stack direction="row" spacing={1}>
            <TaskAlt fontSize="large" color="success" />
            <Typography component="span" variant="h6" color="success">
                ON
            </Typography>
        </Stack>
    ) : (
        <Stack direction="row" spacing={1}>
            <HighlightOff fontSize="large" color="error" />
            <Typography component="span" variant="h6" color="error">
                OFF
            </Typography>
        </Stack>
    );
};

const CurrentAllocations = observer(() => {
    return (
        <Grid size={12}>
            <Grid
                sx={{
                    maxHeight: "62vh",
                    height: "100%",
                    ...outline,
                    border: `1px solid ${grey["500"]}`,
                }}
            >
                <Typography component="span" variant="h6" color="textPrimary">
                    Current Allocations
                </Typography>

                <Grid
                    sx={{
                        display: "flex",
                        borderBottom: `1px solid ${grey["500"]}`,
                        marginTop: "18px",
                    }}
                >
                    {" "}
                    <Column name="Client" width="35%" />
                    <Column name="Dedicated" width="15%" />
                    <Column name="Shared" width="15%" />
                    <Column name="Total Resources" width="15%" />
                    <Column name="Last Updated" width="20%" />
                </Grid>

                {jobStatus?.extractionTelemetryList?.map(extractionTelemetry => {
                    const key = extractionTelemetry.id;

                    return (
                        <Grid
                            key={key}
                            sx={{
                                display: "flex",
                                marginTop: "5px",
                                alignItems: "center",
                            }}
                        >
                            <Data
                                width="35%"
                                value={
                                    clientList.list.find(
                                        cl => cl.id === extractionTelemetry.clientId
                                    )?.name
                                }
                            />
                            <Data width="15%" value={extractionTelemetry.dedicatedServiceUser} />
                            <Data width="15%" value={extractionTelemetry.sharedServiceUser} />
                            <Data
                                width="15%"
                                value={extractionTelemetry.totalEffectiveServiceUser.toFixed(3)}
                            />
                            <Data
                                width="20%"
                                value={getUserFriendlyTime(extractionTelemetry.timestamp)}
                                tooltip={formatDateTime(
                                    extractionTelemetry.timestamp,
                                    DATE_TIME_FORMAT
                                )}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Grid>
    );
});

const AdminExtractionStatus = observer(() => {
    return (
        <Grid size={12}>
            <Grid
                sx={{
                    maxHeight: "62vh",
                    height: "100%",
                    ...outline,
                    border: `1px solid ${grey["500"]}`,
                }}
            >
                <Typography component="span" variant="h6" color="textPrimary">
                    Studies Awaiting Extraction
                </Typography>

                {jobStatus?.extractionTelemetryList?.length === 0 ? (
                    <NoData message="No Studies Awaiting Extraction Found" />
                ) : (
                    <>
                        <Grid
                            sx={{
                                display: "flex",
                                borderBottom: `1px solid ${grey["500"]}`,
                                marginTop: "18px",
                            }}
                        >
                            <Column name="Client" width="35%" />
                            <Column name={TRIAL_RUN_STUDY_TEXT} width="10%" />
                            <Column name="Full DBs" width="10%" />
                            <Column name="Addons" width="10%" />
                            <Column name="Waiting Score" width="15%" />
                            <Column name="Last Updated" width="20%" />
                        </Grid>

                        {jobStatus?.extractionTelemetryList?.map(extractionTelemetry => {
                            const key = extractionTelemetry.id;

                            return (
                                <Grid
                                    key={key}
                                    sx={{
                                        display: "flex",
                                        marginTop: "5px",
                                        alignItems: "center",
                                    }}
                                >
                                    <Data
                                        width="35%"
                                        value={
                                            clientList.list.find(
                                                cl => cl.id === extractionTelemetry.clientId
                                            )?.name
                                        }
                                    />
                                    <Data width="10%" value={extractionTelemetry.pilotRuns} />
                                    <Data width="10%" value={extractionTelemetry.fullDbs} />
                                    <Data width="10%" value={extractionTelemetry.addons} />
                                    <Data
                                        width="15%"
                                        value={extractionTelemetry.waitingTimePoint.toFixed(2)}
                                    />
                                    <Data
                                        width="20%"
                                        value={getUserFriendlyTime(extractionTelemetry.timestamp)}
                                        tooltip={formatDateTime(
                                            extractionTelemetry.timestamp,
                                            DATE_TIME_FORMAT
                                        )}
                                    />
                                </Grid>
                            );
                        })}
                    </>
                )}
            </Grid>
        </Grid>
    );
});

const DisplayMessages = observer(() => {
    const classes = useLocalStyles();

    if (!broadcast.messages) {
        return;
    }

    let maxHeight;
    if (session.isAdmin) {
        // For now, Admin User does not have "Activities" cards.
        // So, use the white space to increase height of notification.
        maxHeight = window.innerHeight < 800 ? "45vh" : "60vh";
    } else {
        maxHeight = window.innerHeight < 800 ? "30vh" : "45vh";
    }

    return (
        <div className={classes.messages} style={{ maxHeight: maxHeight }}>
            <Typography component="div" variant="h6" color="textPrimary" style={{ margin: "20px" }}>
                <WarningIcon sx={{ verticalAlign: "text-top" }} color="warning" /> Notice
            </Typography>
            <List className={classes.root}>
                {broadcast.messages?.length === 0 ? (
                    <NoData message="You do not have any notifications" />
                ) : (
                    <>
                        {broadcast.messages
                            .slice()
                            .sort((a, b) => {
                                return a.severity === b.severity
                                    ? Date.parse(b.createdOn) - Date.parse(a.createdOn)
                                    : a.severity - b.severity;
                            })
                            .map((message, index) => {
                                return (
                                    <div key={index}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                marginBottom: "10px",
                                                marginX: "10px",
                                            }}
                                        >
                                            <ListItem key={index}>
                                                <ListItemText
                                                    primary={
                                                        <Stack
                                                            direction="row"
                                                            alignItems="center"
                                                            gap={2}
                                                            display="block"
                                                            sx={{
                                                                overflowWrap: "break-word", //Wrap the sentence to next line if there is an overflow
                                                                marginBottom: "10px",
                                                            }}
                                                        >
                                                            {message.messageSummary}
                                                        </Stack>
                                                    }
                                                    secondary={
                                                        <React.Fragment>
                                                            {formatDate(message.createdOn)}
                                                            <Typography
                                                                component="span"
                                                                variant="body2"
                                                                className={classes.block}
                                                                color="textPrimary"
                                                            >
                                                                {message.messageDetails}
                                                            </Typography>
                                                        </React.Fragment>
                                                    }
                                                />
                                                <Severity
                                                    severity={severityName[message.severity]}
                                                />
                                            </ListItem>
                                        </Paper>
                                    </div>
                                );
                            })}
                    </>
                )}
            </List>
        </div>
    );
});

const Severity = observer(({ severity }) => {
    const systemTheme = useTheme();

    const setColour = {
        High: { bgColour: "MistyRose", colour: "error" },
        Medium: { bgColour: "Cornsilk", colour: "warning" },
        Low: { bgColour: "LightBlue", colour: "primary" },
    };

    return (
        <Stack direction="row" alignItems="center" gap={0} display="inline-flex" marginX="20px">
            <Chip
                label={
                    <Typography
                        fontSize="small"
                        margin="15px"
                        color={setColour[severity].colour + "." + systemTheme.palette.mode}
                        fontWeight="bold"
                    >
                        {severity}
                    </Typography>
                }
                sx={{ width: "100px", borderWidth: "1.5px" }}
                variant="outlined"
                color={setColour[severity].colour}
            />
        </Stack>
    );
});

export default Dashboard;
