import React, { useMemo, useState } from "react";
import { TableComponent } from "./TableComponent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import {
    ADD_USERS,
    BACK_TO_ALL_PROJECTS,
    baseMRTOptions,
    CREATE_NEW_STUDY,
    PROJECT_ROLE,
    projectTeamTableHeader,
    radioOptionsProjectUserRole,
    STUDY_TYPES,
} from "../../constants/index";
import makeStyles from "@mui/styles/makeStyles";
import { TabPanel } from "../Common/TabPanel";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import AppBar from "@mui/material/AppBar";
import { BasicButton, CardHeader, Confirm, Radiogroup, ShowSuccess } from "../Common";
import Drawer from "@mui/material/Drawer";
import { addSlNo, prepareData } from "../../utils";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

import { observer } from "mobx-react";
import projectDetails from "../../state/store/projects/details";
import session from "../../state/store/session";
import events from "../../lib/events";
import jobStatus from "../../state/store/study/job-status";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AddOutlined from "@mui/icons-material/AddOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import RemoveOutlined from "@mui/icons-material/RemoveOutlined";
import user from "../../state/store/user";
import InfoIcon from "@mui/icons-material/Info";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Autocomplete from "@mui/material/Autocomplete";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { MRTDataTableTitle } from "../Common/MRTDataTableTitle.jsx";

const ACTIVE_TAB = 0;
const drawerWidth = "600px";
const useStyles = makeStyles(_ => ({
    root: {
        flexGrow: 1,
        width: "100%",
        //backgroundColor: theme.palette.background.paper,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    buttonsEnd: {
        display: "flex",
        justifyContent: "flex-end",
    },
}));

function a11yProps(index) {
    return {
        id: `scrollable-force-tab-${index}`,
        "aria-controls": `scrollable-force-tabpanel-${index}`,
    };
}

export const AddUser = observer(({ results, toggleDrawer, projectID }) => {
    const [userType, setUserType] = React.useState("1");
    const classes = useStyles();
    const [user, setUser] = React.useState("");

    const handleDDChange = value => {
        setUser(value || "");
    };

    const handleChange = value => {
        setUserType(value);
    };

    const addUser = async () => {
        const payload = {
            userId: user?.value,
            role: userType,
        };
        await projectDetails.saveTeam(projectID, payload);
        setUser("");
    };

    const AddNewUser = () => {
        return (
            <div>
                <Autocomplete
                    options={results}
                    getOptionKey={option => (option ? option.value : "")}
                    getOptionLabel={option => (option ? option.label : "")}
                    value={user}
                    onChange={(e, newValue) => {
                        handleDDChange(newValue);
                    }}
                    sx={{ margin: 1, minWidth: 200 }}
                    renderInput={params => <TextField {...params} label="Select User" />}
                />
                <br />
                <br />
                <h4>User Type</h4>
                <Radiogroup
                    name="radioUsers"
                    radioOptions={radioOptionsProjectUserRole}
                    value={userType}
                    handleChange={e => handleChange(e.target.value)}
                />
                <br />
                <BasicButton
                    handleClick={() => toggleDrawer(false)()}
                    buttonText="Close"
                    style={{ marginRight: "15px" }}
                    variant="outlined"
                />
                <BasicButton
                    disabled={user === ""}
                    handleClick={e => addUser(e)}
                    buttonText="Add"
                />
            </div>
        );
    };

    return (
        <>
            <form className={classes.root} noValidate autoComplete="off">
                <Container role="presentation">
                    <br />
                    {results?.length > 0 ? (
                        <>
                            <h3>Add New User</h3>
                            <AddNewUser />
                        </>
                    ) : (
                        <h3>No new users found to add</h3>
                    )}
                    <br />
                </Container>
            </form>
        </>
    );
});

export const FetchAndDisplayUsersToBeAdded = observer(props => {
    React.useEffect(() => {
        projectDetails.loadNonProjectUsers(props.projectID);
    }, [props.projectID]);

    return (
        <AddUser
            results={prepareData(projectDetails.nonusers, {
                value: "userId",
                label: "userFullName",
            })}
            {...props}
        />
    );
});

export function AddUsersDrawer(props) {
    const classes = useStyles();
    const [displayDrawer, setDisplayDrawer] = React.useState(false);
    const [width] = React.useState(500);
    const { isActiveClient } = props;

    const toggleDrawer = open => () => {
        setDisplayDrawer(open);
    };

    return (
        <div>
            <React.Fragment>
                <BasicButton
                    handleClick={toggleDrawer(true)}
                    buttonText={ADD_USERS}
                    style={{ marginBottom: "10px" }}
                    disabled={!projectDetails.activeProject || !isActiveClient}
                />
                <Drawer
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                    anchor="right"
                    open={displayDrawer}
                    onClose={toggleDrawer(false)}
                    slotProps={{
                        paper: { style: width },
                        marginTop: "64px",
                        zIndex: theme => theme.zIndex.drawer + 1, // Ensure proper z-index
                    }}
                >
                    <FetchAndDisplayUsersToBeAdded toggleDrawer={toggleDrawer} {...props} />
                </Drawer>
            </React.Fragment>
        </div>
    );
}

export const DisplayProjectTeam = ({ results, ...rest }) => {
    const { isActiveClient } = rest;

    const columns = useMemo(
        () => [
            {
                accessorKey: "slNo",
                header: "Sl No",
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                maxSize: 30,
            },
            {
                accessorKey: "userId",
                header: "User ID",
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                size: 200,
            },
            {
                accessorKey: "userFullName",
                header: "User Name",
                enableColumnFilter: true,
                enableSorting: true,
                filterVariant: "autocomplete",
                size: 200,
            },
            {
                accessorKey: "roleDescription",
                header: "Role",
                enableColumnFilter: true,
                enableSorting: true,
                size: 150,
                filterVariant: "select",
            },
            {
                accessorKey: "actions",
                header: "Actions",
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                size: 120,
                Cell: ({ row }) => {
                    const rowData = row.original;
                    const { isProjectOwner, activeProject } = projectDetails;

                    /**
                     * This function is will check if.
                     * Client is Active
                     * And Project is active
                     * And change being done is not against Owner of the project.
                     */
                    const allowAction = () => {
                        if (!isActiveClient) {
                            return false;
                        }

                        // If its not an active project, no one can delete
                        if (!activeProject) {
                            return false;
                        }
                        // From here on, its an active project & client

                        return rowData.role !== PROJECT_ROLE.OWNER;
                    };

                    /**
                     * This function is written in a proper sequence.
                     * And it makes a lot of decision based on the sequence.
                     * If the sequence needs to be modified, please test the requirements properly.
                     */
                    const canDelete = () => {
                        // If its not an active client, no one can delete
                        if (!allowAction()) {
                            return false;
                        }

                        if (session.isAdmin || isProjectOwner) {
                            // Allow Admin/Project Owner to delete other roles except owner.
                            return rowData.role !== PROJECT_ROLE.OWNER;
                        }

                        return false; // Block delete by default
                    };

                    const canChangeRole = () => {
                        if (!allowAction()) {
                            return false;
                        }

                        if (session.isAdmin || isProjectOwner) {
                            // Allow Admin/Project Owner to change other roles.
                            return rowData.role !== PROJECT_ROLE.OWNER;
                        }

                        return false; // Block changing role by default
                    };

                    return (
                        <Box>
                            {canDelete() && (
                                <Tooltip title="Delete User" aria-label="Delete User">
                                    <IconButton
                                        onClick={async () => {
                                            const { isConfirmed } = await Confirm(
                                                "Remove Team Member",
                                                "Are you sure you want to Remove"
                                            );
                                            if (isConfirmed) {
                                                await projectDetails.removeTeamMember(
                                                    rest.projectID,
                                                    rowData.userId
                                                );
                                            }
                                        }}
                                    >
                                        <DeleteOutline />
                                    </IconButton>
                                </Tooltip>
                            )}

                            {canChangeRole() && (
                                <Tooltip
                                    title={
                                        rowData.role === 1 ? "Change to Co Owner" : "Change to User"
                                    }
                                    aria-label={
                                        rowData.role === 1 ? "Change to Co Owner" : "Change to User"
                                    }
                                >
                                    <IconButton
                                        onClick={async () => {
                                            const role = rowData.role === 2 ? "1" : "2";
                                            const payload = {
                                                userId: rowData.userId,
                                                role,
                                            };
                                            await projectDetails.modifyTeamMember(
                                                rest.projectID,
                                                payload
                                            );
                                        }}
                                    >
                                        {rowData.role === 2 ? <RemoveOutlined /> : <AddOutlined />}
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    );
                },
            },
        ],
        [rest.projectID]
    );

    const data = useMemo(() => addSlNo(results), [results]);

    const table = useMaterialReactTable({
        columns,
        data,
        enableColumnFilters: () => data?.length > 0,
        ...baseMRTOptions,
        renderTopToolbarCustomActions: () => <MRTDataTableTitle title={projectTeamTableHeader} />,
    });

    return (
        <MaterialReactTable
            table={table}
            enableColumnFilters={table?.data?.length > 0}
            enableSorting={table?.data?.length > 0}
            enableColumnActions={table?.data?.length > 0}
            showGlobalFilter={table?.data?.length > 0}
        />
    );
};

export const FetchAndDisplayProjectTeam = observer(props => {
    return (
        <>
            <DisplayProjectTeam results={projectDetails.team} {...props} />
        </>
    );
});

export const ManageTeam = props => {
    React.useEffect(() => {
        if (!projectDetails.team || projectDetails.team?.length === 0) {
            projectDetails.loadTeam(props.projectID);
        }
    }, []);

    return (
        <div>
            {(projectDetails.isProjectOwner || session.isAdmin) && <AddUsersDrawer {...props} />}
            <FetchAndDisplayProjectTeam {...props} />
        </div>
    );
};

const DisplayTabs = observer(props => {
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

    return (
        <div>
            <AppBar
                sx={{ backgroundColor: "background.paper" }}
                position="static"
                enableColorOnDark
            >
                <Tabs
                    value={value}
                    centered
                    onChange={handleChange}
                    scrollButtons
                    indicatorColor="primary"
                    textColor="primary"
                    aria-label="scrollable force tabs example"
                    allowScrollButtonsMobile
                >
                    <Tab label="Studies" icon={<AccountTreeIcon />} {...a11yProps(0)} />
                    <Tab label="Team" icon={<GroupIcon />} {...a11yProps(1)} />
                    {canSee && (
                        <Tab label="Manage Project" icon={<SettingsIcon />} {...a11yProps(2)} />
                    )}
                </Tabs>
            </AppBar>
            <TabPanel value={value} index={0}>
                <TableComponent {...props} data={projectDetails.jobs} />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <ManageTeam {...props} isActiveClient={isActiveClient} />
            </TabPanel>
            {canSee && (
                <TabPanel value={value} index={2}>
                    <ManageProject {...props} isActiveClient={isActiveClient} />
                </TabPanel>
            )}
        </div>
    );
});

const ManageProject = observer(props => {
    const classes = useStyles();
    const [eligibleNewOwners, setEligibleNewOwners] = useState([]);
    const [showTransfer, setShowTransfer] = useState(false);
    const [newOwnerDropdownIndex, setNewOwnerDropdownIndex] = React.useState(eligibleNewOwners[0]);
    const [newOwnerDetails, setNewOwnerDetails] = React.useState();

    const projectActionLabel = projectDetails.activeProject ? "Archive" : "Restore";
    const deleteThisProjectButtonColor = projectDetails.activeProject ? "error" : "success";
    const { isActiveClient } = props;

    const updateStatus = async () => {
        if (!projectDetails.activeProject) {
            const { isConfirmed } = await Confirm(
                "Restore Project",
                "Are you sure you want to restore this project?"
            );
            if (isConfirmed) {
                const results = await projectDetails.reactivate(projectDetails.data.projectID);
                if (results) {
                    ShowSuccess("Project Restored");
                }
            }
        } else {
            const { isConfirmed } = await Confirm(
                "Archive Project",
                "Are you sure you want to archive this project?"
            );
            if (isConfirmed) {
                const results = await projectDetails.delete(projectDetails.data.projectID);
                if (results) {
                    ShowSuccess("Project Archived");
                    projectDetails.resetProject();
                }
            }
        }
    };

    const onClickShowTransfer = () => {
        // Toggle the transfer ownership component
        setShowTransfer(!showTransfer);

        // If transfer ownership component is visible
        if (showTransfer === false) {
            // Select current team members except the current project owner
            setEligibleNewOwners(
                prepareData(
                    projectDetails.team.filter(a => a.role !== PROJECT_ROLE.OWNER),
                    { value: "userId", label: "userFullName" }
                )
            );
        }
    };

    const handleDDChange = value => {
        setNewOwnerDropdownIndex(value);
        setNewOwnerDetails(value);
    };

    async function transferTheProject() {
        const role = PROJECT_ROLE.OWNER;
        const payload = {
            userId: newOwnerDetails.value,
            role,
        };
        const result = await projectDetails.transferOwnership(props.projectID, payload);
        setShowTransfer(false);
        if (result) {
            ShowSuccess("Project ownership has been transferred");
            projectDetails.resetProject();
        }
    }

    const TransferOwnership = observer(() => {
        const cannotTransferProject =
            !isActiveClient || !newOwnerDetails || !projectDetails.activeProject;

        return (
            <div style={{ marginTop: "20px" }}>
                <Grid
                    container
                    spacing={2}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Grid size={10}>
                        <CardHeader
                            title={"Transfer this project to another user in your organization"}
                        />
                    </Grid>

                    <Grid>
                        <BasicButton
                            variant="outlined"
                            color="error"
                            handleClick={async () => {
                                if (showTransfer === false) {
                                    if (!projectDetails.team || projectDetails.team?.length === 0) {
                                        await projectDetails.loadTeam(props.projectID);
                                    }
                                }
                                onClickShowTransfer();
                            }}
                            buttonText={showTransfer ? "Cancel" : "Transfer"}
                            style={{ display: "flex" }}
                            disabled={!isActiveClient || !projectDetails.activeProject}
                        />
                        <div className={classes.buttonsEnd}></div>
                    </Grid>
                    {showTransfer && (
                        <>
                            <Grid size={12}>
                                <Divider></Divider>
                            </Grid>
                            <Grid size={6}>
                                <CardContent>
                                    Select a person you would like to transfer the ownership to
                                </CardContent>
                            </Grid>
                            <Grid></Grid>
                            <Autocomplete
                                size={"small"}
                                options={eligibleNewOwners}
                                getOptionLabel={option => option.label}
                                value={newOwnerDropdownIndex}
                                onChange={(e, newValue) => handleDDChange(newValue)}
                                sx={{ width: 300 }}
                                renderInput={params => <TextField {...params} label="search" />}
                            />
                            <Grid size={8}>
                                <CardContent>
                                    You are transferring the ownership to{" "}
                                    <b>
                                        {newOwnerDetails
                                            ? newOwnerDetails?.label +
                                              " <" +
                                              newOwnerDetails?.value +
                                              ">"
                                            : ""}
                                    </b>
                                    <br />
                                </CardContent>
                            </Grid>
                            <Grid>
                                <BasicButton
                                    variant="outlined"
                                    color="error"
                                    handleClick={async () => {
                                        const { isConfirmed } = await Confirm(
                                            "Transfer the project",
                                            "Are you sure you want to transfer the project to " +
                                                newOwnerDetails?.label +
                                                "?"
                                        );
                                        if (isConfirmed) {
                                            transferTheProject();
                                        } else {
                                            setNewOwnerDetails(undefined);
                                            setNewOwnerDropdownIndex(undefined);
                                        }
                                    }}
                                    buttonText={"Transfer this project"}
                                    style={{ display: "flex" }}
                                    disabled={cannotTransferProject}
                                />
                                <div className={classes.buttonsEnd}></div>
                            </Grid>
                            <Grid size={12}>
                                <Alert variant="outlined" severity="warning" size={"small"}>
                                    This page will reload after transfer
                                </Alert>
                            </Grid>
                        </>
                    )}
                </Grid>
            </div>
        );
    });

    return (
        <div>
            <CssBaseline />
            <Grid
                container
                spacing={2}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Grid size={8}>
                    <CardHeader title={`${projectActionLabel} this project`} />
                </Grid>
                <Grid>
                    <BasicButton
                        variant="outlined"
                        color={deleteThisProjectButtonColor}
                        handleClick={() => updateStatus(status)}
                        buttonText={`${projectActionLabel} this project`}
                        style={{ display: "flex" }}
                        disabled={!isActiveClient}
                    />
                    <div className={classes.buttonsEnd}></div>
                </Grid>
            </Grid>
            <TransferOwnership></TransferOwnership>
        </div>
    );
});

const DisplayProjectName = ({ projectName }) => {
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 9, md: 9, lg: 9 }}>
                <Typography variant={"h4"}>
                    {projectName}
                    {"  "}
                    {!projectDetails.activeProject && (
                        <Chip variant="outlined" label="Archived" color="error" />
                    )}
                </Typography>
            </Grid>
        </Grid>
    );
};

export const DisplayNewProjectAndBackToAllProjects = observer(({ handleClickOpen }) => {
    React.useEffect(() => {
        if (jobStatus.status === null || jobStatus.status === "") {
            (async () => {
                await jobStatus.checkStatus();
            })();
        }
    }, []);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const { isActiveClient } = user;

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (event, study) => {
        setAnchorEl(null);
        handleClickOpen(event, null, study, "create");
        // null ==> Its a new study being created and so id  is null.
        // TO ensure the mode is not Modify, we are simply passing this dummy "create" parameter.
        // This will ensure "Multiple Records" tab is not loaded when we try to create a new study
    };

    const handleCancel = () => {
        setAnchorEl(null);
    };

    const jobStatusDisabled = jobStatus.status !== "true";

    return (
        <Grid container spacing={2} direction="row">
            <Grid size={{ xs: 9, md: 9, lg: 9 }}>
                <h2>
                    <BasicButton
                        handleClick={() => {
                            events.emit("reset.jobs", []);
                            projectDetails.resetProject();
                            session.unsubscribeFromProjectUpdates(projectDetails.subscribedProject);
                        }}
                        buttonText={BACK_TO_ALL_PROJECTS}
                        variant="outlined"
                    />
                </h2>
            </Grid>
            <Grid
                style={{
                    alignItems: "center",
                    justifyContent: "flex-end",
                    display: "flex",
                }}
                size={{
                    xs: 3,
                    md: 3,
                    lg: 3,
                }}
            >
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        aria-controls="simple-menu"
                        aria-haspopup="true"
                        onClick={handleClick}
                        disabled={
                            !projectDetails.activeProject ||
                            projectDetails.isProjectUser ||
                            jobStatusDisabled ||
                            !isActiveClient
                        }
                    >
                        {CREATE_NEW_STUDY}
                    </Button>

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
                        id="simple-menu"
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
            </Grid>
        </Grid>
    );
});

export const ShowProjectTabs = observer(props => {
    return (
        <Grid size={{ xs: 12, md: 12, lg: 12 }}>
            <Paper className={props.className}>
                <DisplayTabs {...props} />
            </Paper>
        </Grid>
    );
});

export const DisplayProjectDetails = observer(
    ({
        projectName,
        handleClickOpen,
        projectID,
        setStudyID,
        setMode,
        setStudyDesign,
        ...props
    }) => {
        const jobUpdated = projectDetails.jobUpdated;
        const classes = useStyles();

        const getProjectDetails = async projectID => {
            await projectDetails.loadJobs(projectID);
            await (session.isAdmin && user.getClientDetailByProjectId(projectID));
            await projectDetails.getDatabase(projectID);
        };

        const refreshPage = async () => {
            await projectDetails.load(projectID);
            await getProjectDetails(projectID);
            projectDetails.setJobUpdated(false);
        };

        const onComponentDestruct = () => {
            projectDetails.setJobUpdated(false);
        };

        React.useEffect(() => {
            projectDetails.setTeam([]);
            getProjectDetails(projectID);
        }, [projectID]);

        React.useEffect(() => {
            //Restore drawer status to its previous state (expanded or minimized) when user exits from study design
            session.setDrawerStatus(projectDetails.drawerStatus);
            return () => onComponentDestruct();
        }, []);

        return (
            <div className={classes.root}>
                <DisplayProjectName projectName={projectName} />
                {jobUpdated && (
                    <div style={{ marginBottom: "10px", textAlign: "end" }}>
                        <Link component="button" variant="body1" onClick={refreshPage}>
                            New updates available, click here to refresh
                        </Link>
                    </div>
                )}
                <DisplayNewProjectAndBackToAllProjects
                    handleClickOpen={handleClickOpen}
                    active={projectDetails.data.status}
                    projectID={projectID}
                />
                <ShowProjectTabs
                    projectName={projectName}
                    projectID={projectID}
                    classes={classes.paper}
                    setStudyID={setStudyID}
                    setStudyDesign={setStudyDesign}
                    setMode={setMode}
                    {...props}
                    handleClickOpen={handleClickOpen}
                />
            </div>
        );
    }
);
