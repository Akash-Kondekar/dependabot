import React from "react";
import { ALL_PROJECTS, CREATE_A_NEW_STUDY, STUDY_TYPES } from "../../constants/index";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Link from "@mui/material/Link";

import { observer } from "mobx-react";
import projectDetails from "../../state/store/projects/details";
import session from "../../state/store/session";
import events from "../../lib/events";
import jobStatus from "../../state/store/study/job-status";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import user from "../../state/store/user";
import InfoIcon from "@mui/icons-material/Info";
import Box from "@mui/material/Box";
import { TabPanel } from "../Common/TabPanel.jsx";
import { BasicButton } from "../Common/BasicButton.jsx";
import { BasicLink } from "../Common/BasicLink.jsx";
import { useTheme } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid2";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
import projectDetailsStore from "../../state/store/projects/details.js";
import { useLocation, useNavigate } from "react-router-dom";
import { ProjectStudiesTable } from "./ProjectStudiesTable.jsx";
import ProjectTeam from "./ProjectTeam.jsx";
import ProjectArchiveAndTransfer from "./ProjectArchiveAndTransfer.jsx";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

const ACTIVE_TAB = 0;

function a11yProps(index) {
    return {
        id: `scrollable-force-tab-${index}`,
        "aria-controls": `scrollable-force-tabpanel-${index}`,
    };
}

export const DisplayNewProjectAndProjectName = observer(({ /*handleClickOpen,*/ projectName }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const { isActiveClient } = user;
    const navigate = useNavigate();

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (/*event, study*/) => {
        setAnchorEl(null);
        navigate("/coming-soon");
        //handleClickOpen(event, null, study, "create");
        // null ==> Its a new study being created and so id  is null.
        // TO ensure the mode is not Modify, we are simply passing this dummy "create" parameter.
        // This will ensure "Multiple Records" tab is not loaded when we try to create a new study
    };

    const handleCancel = () => {
        setAnchorEl(null);
    };

    React.useEffect(() => {
        (async () => {
            await jobStatus.checkStatus();
        })();
    }, []);

    const jobStatusDisabled = jobStatus.status !== "true";

    return (
        <Stack spacing={2} justifyContent="space-between" direction="row" alignItems="center">
            <Stack spacing={1} direction="row" alignItems="center">
                <Tooltip title={projectName}>
                    <Typography variant="h4" sx={{ textOverflow: "ellipsis", overflow: "hidden" }}>
                        {projectName}
                    </Typography>
                </Tooltip>
                {!projectDetails.activeProject && (
                    <Chip variant="outlined" label="Archived" color="error" />
                )}
            </Stack>
            <div>
                <BasicButton
                    aria-controls="create new study menu"
                    aria-haspopup="true"
                    handleClick={handleClick}
                    disabled={
                        !projectDetails.activeProject ||
                        projectDetails.isProjectUser ||
                        jobStatusDisabled ||
                        !isActiveClient
                    }
                    buttonText={CREATE_A_NEW_STUDY}
                />

                {!isActiveClient && (
                    <Tooltip
                        title={
                            <div
                                style={{
                                    whiteSpace: "pre-wrap",
                                    maxHeight: "500px",
                                    overflow: "auto",
                                }}
                            >
                                {`You cannot submit data extraction, ${user?.clientStatusMessage}`}
                            </div>
                        }
                        placement="right"
                        aria-label="cannot submit job"
                    >
                        <IconButton color="error" aria-label="Client status" size="large">
                            <InfoIcon />
                        </IconButton>
                    </Tooltip>
                )}
                <Menu
                    id="Study design menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleCancel}
                >
                    {Object.keys(STUDY_TYPES).map(study => {
                        return (
                            <MenuItem key={study} onClick={e => handleClose(e, study)}>
                                {STUDY_TYPES[study]}
                            </MenuItem>
                        );
                    })}
                </Menu>
            </div>
        </Stack>
    );
});

export const ShowProjectTabs = observer(props => {
    const [value, setValue] = React.useState(ACTIVE_TAB);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const isAdmin = session.isAdmin;
    const loggedInUser = session.loggedInUser;
    const isProjectOwner =
        projectDetails.data?.projectOwnerID?.trim()?.toLowerCase() === loggedInUser;

    const { isActiveClient } = user;

    const ACTIVE = 1;

    let canSee = false;
    if (projectDetails.status === ACTIVE && (isProjectOwner || isAdmin)) {
        canSee = true;
    }

    if (projectDetails.status !== ACTIVE && isAdmin) {
        canSee = true;
    }

    const tabsUnderLineWidth = canSee ? "500px" : "285px";

    return (
        <>
            <Box sx={{ pl: 2, pt: 2, maxWidth: tabsUnderLineWidth }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    scrollButtons
                    indicatorColor="primary"
                    textColor="primary"
                    aria-label="scrollable force tabs example"
                    allowScrollButtonsMobile
                >
                    <Tab label="Studies" {...a11yProps(0)} sx={{ px: 5 }} />
                    <Tab label="Team" {...a11yProps(1)} sx={{ px: 5 }} />
                    {canSee && <Tab label="Manage Project" {...a11yProps(2)} sx={{ px: 5 }} />}
                </Tabs>
                <Divider variant="fullWidth" />
            </Box>
            <TabPanel value={value} index={0}>
                <ProjectStudiesTable {...props} data={projectDetails.jobs} />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <ProjectTeam {...props} isActiveClient={isActiveClient} />
            </TabPanel>
            {canSee && (
                <TabPanel value={value} index={2}>
                    <ProjectArchiveAndTransfer {...props} isActiveClient={isActiveClient} />
                </TabPanel>
            )}
        </>
    );
});

export const ProjectDetails = observer(({ ...props }) => {
    const [highlightConsumed, setHighlightConsumed] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { projectID = "", projectName = "" } = projectDetailsStore.project;
    const jobUpdated = projectDetails.jobUpdated;
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const highlightJobIdFromLocation = location?.state?.highlightJobId;

    const previousProjectId = React.useRef(projectID);

    const getProjectDetails = async projectID => {
        await projectDetails.loadJobs(projectID);
        await (session.isAdmin && user.getClientDetailByProjectId(projectID));
        await projectDetails.getDatabase(projectID);
    };
    const BackToProjects = () => {
        return (
            <BasicLink
                handleClick={() => {
                    events.emit("reset.jobs", []);
                    projectDetails.resetProject();
                    session.unsubscribeFromProjectUpdates(projectDetails.subscribedProject);
                    navigate("/projects/new");
                }}
                buttonText={ALL_PROJECTS}
                displayArrow={true}
            />
        );
    };

    React.useEffect(() => {
        if (!projectID || projectID.length < 1) {
            events.emit("reset.jobs", []);
            projectDetails.resetProject();
            session.unsubscribeFromProjectUpdates(projectDetails.subscribedProject);
            navigate("/projects/new");
        }
    }, []);

    React.useEffect(() => {
        if (!projectID || projectID.length < 1) {
            events.emit("reset.jobs", []);
            projectDetails.resetProject();
            session.unsubscribeFromProjectUpdates(projectDetails.subscribedProject);
            return;
        }

        // 2. Clean up previous subscription if projectID changed
        if (previousProjectId.current !== projectID) {
            session.unsubscribeFromProjectUpdates(previousProjectId.current);
            projectDetailsStore.setSubscribedProject("");
        }

        // 3. Subscribe to new project
        if (projectID) {
            session.subscribeToProjectUpdates(projectID);
            projectDetailsStore.setSubscribedProject(projectID);
        }

        // 4. Update the ref
        previousProjectId.current = projectID;

        projectDetails.setTeam([]);
        getProjectDetails(projectID);

        //Restore drawer status to its previous state (expanded or minimised) when user exits from study design
        session.setDrawerStatus(projectDetails.drawerStatus);
        projectDetails.setJobUpdated(false);

        // 5. Cleanup function - Before component teardown, make sure to unsubscribe
        return () => {
            if (projectID) {
                session.unsubscribeFromProjectUpdates(projectID);
                projectDetailsStore.setSubscribedProject("");
            }
        };
    }, [projectID]);

    const refreshPage = async () => {
        await projectDetails.load(projectID);
        await getProjectDetails(projectID);
        projectDetails.setJobUpdated(false);
    };
    if (!projectID || projectID.length < 1) {
        return (
            <Container maxWidth="xl">
                <BackToProjects />
            </Container>
        );
    }
    return (
        <Container maxWidth="xl">
            <Grid container spacing={2}>
                <Grid size={12}>
                    <BackToProjects />
                </Grid>
                <Grid size={12}>
                    <DisplayNewProjectAndProjectName
                        handleClickOpen={() => {}} //handleClickOpen}
                        active={projectDetails.data.status}
                        projectID={projectID}
                        projectName={projectName}
                    />
                </Grid>
                <Grid size={12}>
                    {jobUpdated && (
                        <div style={{ marginBottom: "10px", textAlign: "end" }}>
                            <Link component="button" variant="body1" onClick={refreshPage}>
                                New updates available, click here to refresh
                            </Link>
                        </div>
                    )}
                </Grid>
                <Grid size={12}>
                    <Box sx={{ borderRadius: 8, bgcolor: isDarkMode ? "grey.main" : "grey.light" }}>
                        <ShowProjectTabs
                            projectName={projectName}
                            projectID={projectID}
                            setStudyID={() => {}}
                            setStudyDesign={() => {}}
                            setMode={() => {}}
                            {...props}
                            highlightJobId={!highlightConsumed ? highlightJobIdFromLocation : null}
                            onHighlightUsed={() => setHighlightConsumed(true)}
                            handleClickOpen={() => {}} //handleClickOpen}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
});
