import React, { useMemo } from "react";
import { tableIcons } from "../Common/DisplayTable";
import {
    ANALYTICS_JOB_STATUS,
    ARCHIVED_PROJECT_MSG,
    baseMRTOptions,
    GetIconForThisStatus,
    INC_PREV,
    JOB_STATUS,
    JOBS,
    radioOptionsDatabaseTypes,
    SESSION_EXPIRED,
    STUDY_TYPES,
} from "../../constants";

import { BasicButton, Confirm, Copy, DisplayAvatar, ShowError, ShowSuccess } from "../Common";

import { Grid2 as Grid, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";

import { addSlNo, formatDate, formatTextForResults } from "../../utils";
import AssessmentIcon from "@mui/icons-material/Assessment";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AddIcon from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";

import makeStyles from "@mui/styles/makeStyles";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import Container from "@mui/material/Container";
import projectDetails from "../../state/store/projects/details";
import { observer } from "mobx-react";
import Card from "@mui/material/Card";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import session from "../../state/store/session";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { TabPanel } from "../Common/TabPanel";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import user from "../../state/store/user";
import { useNavigate } from "react-router-dom";
import { SummaryDetails } from "../Study/Summary/SummaryDialog";
import commonJobsStore from "../../state/store/study/common";
import commonAnalyticsStore from "../../state/store/study/analytics/common";
import DataExtractionReport from "../Study/Analytics/DataExtractionReport";
import ArticleIcon from "@mui/icons-material/Article";
import Dialog from "@mui/material/Dialog";
import FullDatabaseRequestDialog from "./FullDatabaseRequestDialog.jsx";
import { ManageProtocolDialog } from "./ManageProtocolDialog.jsx";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { MaterialReactTable } from "material-react-table";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { MRTDataTableTitle } from "../Common/MRTDataTableTitle.jsx";
import { PlayArrowOutlined } from "@mui/icons-material";

function a11yProps(index) {
    return {
        id: `scrollable-force-tab-${index}`,
        "aria-controls": `scrollable-force-tabpanel-${index}`,
    };
}

export const TableComponent = observer(props => {
    return (
        <>
            <ShowTable {...props} showAddOnIcon={true} status={status} />
        </>
    );
});

const ShowTable = observer(props => {
    const [rowSelected, setRowSelected] = React.useState({});
    const [open, setOpen] = React.useState(false); // Addons Modal
    const [results, setResults] = React.useState(false); // DataExtractionReport Modal
    const [rowSelectedForMenu, setRowSelectedForMenu] = React.useState({});
    const [showFullDbDialog, setShowFullDbDialog] = React.useState(false);
    const [showManageProtocolDialog, setShowManageProtocolDialog] = React.useState(false);
    const isJob = props.showAddOnIcon === true;
    const type = isJob ? "jobs" : "addons";

    const addOnsProps = {
        setMode: props.setMode,
        handleClickOpen: props.handleClickOpen,
        handleClose: setOpen,
        open,
    };

    const showResultsProps = {
        setMode: props.setMode,
        handleClickOpen: props.handleClickOpen,
        handleClose: setResults,
        open: results,
        rowSelected: rowSelected,
        type,
    };

    const { data, showAddOnIcon } = props;

    async function download(projectId, jobId, type) {
        const tokenExpired = await session.isTokenExpired();
        if (tokenExpired) {
            await session.logout();
            ShowError(SESSION_EXPIRED);
            return;
        }
        ShowSuccess("Download initiated successfully.");

        const newTab = window.open("", "_blank");
        const link = document.createElement("a");

        let address = `${import.meta.env.VITE_APP_API_VIP}/dexter/projects/${projectId}/${type}/${jobId}/download`;
        address += `?userId=${encodeURIComponent(session.loggedInUser)}&token=${
            session.bearerToken
        }`;

        link.href = address;

        link.setAttribute("target", "_blank");
        link.setAttribute("download", "");

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        // Close the tab after initiating the request.
        setTimeout(() => {
            newTab.close();
        }, 500);
    }

    const downloadHTML = async (projectId, jobId, type) => {
        const content = await projectDetails.downloadHTML(projectId, jobId, type);
        const url = window.URL.createObjectURL(new Blob([content.data], { type: "text/html" }));

        const link = document.createElement("a");
        link.setAttribute("target", "_blank");
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isAdmin = session.isAdmin;
    const projectUser = projectDetails.isProjectUser;
    const ownerCoOwner = projectDetails.isProjectOwnerOrCoOwner;
    const owner = projectDetails.isProjectOwner;
    const { isActiveClient, clientDetails } = user;

    const studyDownloadAccess =
        session.hasStudyDownloadAccess && clientDetails?.studyDownloadAccess;
    const higherAccess = (isAdmin || ownerCoOwner) && !projectUser;

    const isAdminOrOwner = isAdmin || owner;

    const userID = session.loggedInUser;
    const readOnly = projectDetails.currentUserProjectRole <= 1;
    const isJobCompleted = rowSelectedForMenu?.status === 3;
    const dataCoverage = rowSelectedForMenu?.dataCoverage === 0;
    const isDraft = rowSelectedForMenu?.status === JOB_STATUS.DRAFT;
    const isJobCancelled = rowSelectedForMenu?.status === 4;

    const disableCancelIcon =
        (!isAdmin && readOnly) || isJobCancelled || isJobCompleted || !projectDetails.activeProject;

    const disableDeleteIcon =
        (!isAdminOrOwner && (rowSelectedForMenu.submittedByUserID !== userID || readOnly)) ||
        !isActiveClient ||
        !projectDetails.activeProject;

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [menuEvent, setMenuEvent] = React.useState(null);

    function openMenu(e, rowData) {
        e.preventDefault();
        setAnchorEl(e.currentTarget);
        setMenuEvent(e);
        setRowSelectedForMenu(rowData);
    }

    const handleCancel = () => {
        setAnchorEl(null);
    };

    const navigate = useNavigate();

    const ContextMenu = () => {
        const disableAddVariable =
            ((!isAdmin || !isJobCompleted) && (readOnly || !isJobCompleted)) ||
            !isActiveClient ||
            !projectDetails.activeProject;
        const disableFullDBRequest =
            ((!isAdmin || !isJobCompleted) && (readOnly || !isJobCompleted)) ||
            !isActiveClient ||
            !projectDetails.activeProject ||
            !projectDetails.isFullDbExtractionAllowed(rowSelectedForMenu.databaseName);
        const JobIcons = () => {
            return (
                <>
                    <Tooltip
                        title={
                            !projectDetails.activeProject ? (
                                <span>
                                    <ErrorOutlineIcon
                                        size="small"
                                        color="error"
                                        sx={{ verticalAlign: "middle" }}
                                    />{" "}
                                    <font style={{ fontSize: "12px" }}>{ARCHIVED_PROJECT_MSG}</font>
                                </span>
                            ) : (
                                "Add Variables"
                            )
                        }
                        placement="top"
                        aria-label="Add Variables"
                    >
                        <div>
                            <MenuItem
                                onClick={() => {
                                    props.setMode(
                                        menuEvent,
                                        rowSelectedForMenu?.jobID,
                                        rowSelectedForMenu?.studyDesign,
                                        "create"
                                    );
                                    handleCancel();
                                }}
                                disabled={disableAddVariable}
                            >
                                <ListItemIcon>
                                    <AddIcon />
                                </ListItemIcon>
                                <ListItemText>Add Variables</ListItemText>
                            </MenuItem>
                        </div>
                    </Tooltip>
                    <MenuItem
                        disabled={
                            rowSelectedForMenu?.jobName === rowSelectedForMenu?.addonLatestStudyName
                        }
                        onClick={() => {
                            setRowSelected(rowSelectedForMenu);
                            setOpen(true);
                            handleCancel();
                        }}
                    >
                        <ListItemIcon>
                            <FolderOpenIcon />
                        </ListItemIcon>
                        <ListItemText>View Addons</ListItemText>
                    </MenuItem>
                    <Tooltip
                        title={
                            !projectDetails.activeProject ? (
                                <span>
                                    <ErrorOutlineIcon
                                        size="small"
                                        color="error"
                                        sx={{ verticalAlign: "middle" }}
                                    />{" "}
                                    <font style={{ fontSize: "12px" }}>{ARCHIVED_PROJECT_MSG}</font>
                                </span>
                            ) : (
                                "Full DB Extraction"
                            )
                        }
                    >
                        <div>
                            <MenuItem
                                onClick={() => {
                                    setShowFullDbDialog(true);
                                    handleCancel();
                                }}
                                disabled={disableFullDBRequest}
                                placement="bottom"
                                aria-label="Full DB Extraction"
                            >
                                <ListItemIcon>
                                    <AllInclusiveIcon />
                                </ListItemIcon>
                                <ListItemText>Request Full DB Extraction</ListItemText>
                            </MenuItem>
                        </div>
                    </Tooltip>
                    <Tooltip
                        title={
                            !projectDetails.activeProject ? (
                                <span>
                                    <ErrorOutlineIcon
                                        size="small"
                                        color="error"
                                        sx={{ verticalAlign: "middle" }}
                                    />{" "}
                                    <font style={{ fontSize: "12px" }}>{ARCHIVED_PROJECT_MSG}</font>
                                </span>
                            ) : (
                                "Manage Protocol for this Study"
                            )
                        }
                    >
                        <div>
                            <MenuItem
                                onClick={() => {
                                    setShowManageProtocolDialog(true);
                                    handleCancel();
                                }}
                                disabled={isDraft || (!isAdmin && !dataCoverage) || !isActiveClient}
                            >
                                <ListItemIcon>
                                    <ArticleIcon />
                                </ListItemIcon>
                                <ListItemText>Manage Protocol for this Study</ListItemText>
                            </MenuItem>
                        </div>
                    </Tooltip>
                </>
            );
        };

        return (
            <>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleCancel}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                    {isJob && <JobIcons />}
                    <Tooltip
                        title={
                            !projectDetails.activeProject ? (
                                <span>
                                    <ErrorOutlineIcon
                                        size="small"
                                        color="error"
                                        sx={{ verticalAlign: "middle" }}
                                    />{" "}
                                    <font style={{ fontSize: "12px" }}>{ARCHIVED_PROJECT_MSG}</font>
                                </span>
                            ) : (
                                "Cancel"
                            )
                        }
                        placement="bottom"
                        aria-label="Cancel"
                    >
                        <span>
                            <MenuItem
                                disabled={disableCancelIcon || !isActiveClient}
                                onClick={async () => {
                                    const { isConfirmed } = await Confirm(
                                        "Cancel",
                                        "Are you sure you want to Cancel"
                                    );
                                    if (isConfirmed) {
                                        if (showAddOnIcon === true) {
                                            // Then it is a Job
                                            await projectDetails.cancelJob(
                                                rowSelectedForMenu?.projectID,
                                                rowSelectedForMenu?.jobID
                                            );
                                            ShowSuccess("Cancelled");
                                        } else {
                                            // Then it is a AddOn
                                            await projectDetails.cancelAddOn(
                                                rowSelectedForMenu?.projectID,
                                                rowSelectedForMenu?.jobID
                                            );
                                            ShowSuccess("Cancelled");
                                            props.handleClose(false);
                                        }
                                        handleCancel();
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <tableIcons.Reject />
                                </ListItemIcon>
                                <ListItemText>Cancel</ListItemText>
                            </MenuItem>
                        </span>
                    </Tooltip>
                    <Tooltip
                        title={
                            !projectDetails.activeProject ? (
                                <span>
                                    <ErrorOutlineIcon
                                        size="small"
                                        color="error"
                                        sx={{ verticalAlign: "middle" }}
                                    />{" "}
                                    <font style={{ fontSize: "12px" }}>{ARCHIVED_PROJECT_MSG}</font>
                                </span>
                            ) : (
                                "Delete"
                            )
                        }
                        placement="bottom"
                        aria-label="Delete"
                    >
                        <span>
                            <MenuItem
                                disabled={disableDeleteIcon}
                                onClick={async () => {
                                    {
                                        const { isConfirmed } = await Confirm(
                                            "Delete",
                                            "Are you sure you want to Delete"
                                        );
                                        if (isConfirmed) {
                                            if (showAddOnIcon === true) {
                                                // Then it is a Job
                                                await projectDetails.removeJob(
                                                    rowSelectedForMenu?.projectID,
                                                    rowSelectedForMenu?.jobID
                                                );
                                                ShowSuccess("Deleted");
                                            } else {
                                                // Then it is a AddOn
                                                await projectDetails.removeAddOn(
                                                    rowSelectedForMenu?.projectID,
                                                    rowSelectedForMenu?.jobID
                                                );
                                                ShowSuccess("Deleted");
                                                props.handleClose(false);
                                            }
                                            handleCancel();
                                        }
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <tableIcons.Delete />
                                </ListItemIcon>
                                <ListItemText>Delete</ListItemText>
                            </MenuItem>
                        </span>
                    </Tooltip>
                </Menu>
            </>
        );
    };

    // Define table columns
    const columns = useMemo(
        () => [
            {
                accessorKey: "slNo",
                header: "Sl No",
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                maxSize: 40,
            },
            {
                accessorKey: "id",
                header: "ID",
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                maxSize: 30,
                enableHiding: type !== JOBS,
                Cell: ({ row }) => {
                    const value = row.original.id;
                    return (
                        <Stack
                            direction="row"
                            sx={{
                                justifyContent: "flex-start",
                                alignItems: "center",
                            }}
                        >
                            <Tooltip title={value}>{value?.substring(0, 8)}</Tooltip>
                            <Stack
                                className="copy-button"
                                sx={{
                                    visibility: "hidden",
                                }}
                            >
                                <Copy text={value} icon={true} />
                            </Stack>
                        </Stack>
                    );
                },
            },
            {
                accessorKey: "jobName",
                header: "Study Name",
                enableSorting: false,
                enableColumnFilter: true,
                filterFn: "contains",
                Cell: ({ renderedCellValue }) => (
                    <div>
                        <Tooltip title={renderedCellValue}>
                            <div
                                style={{
                                    maxWidth: "250px",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                }}
                            >
                                {renderedCellValue}
                            </div>
                        </Tooltip>
                    </div>
                ),
            },
            {
                accessorKey: "databaseName",
                header: "Database",
                enableSorting: isJob,
                enableColumnFilter: isJob,
                maxSize: 60,
                enableHiding: type !== JOBS,
                Cell: ({ renderedCellValue, row }) => {
                    const valueToRender =
                        renderedCellValue + " (" + row.original.databaseVersion + ")";
                    return (
                        <div>
                            <Tooltip title={valueToRender}>
                                <div>{renderedCellValue}</div>
                            </Tooltip>
                        </div>
                    );
                },
                filterVariant: "select",
            },
            {
                accessorKey: "studyDesign",
                header: "Study Design",
                enableSorting: isJob,
                enableColumnFilter: isJob,
                maxSize: 40,
                enableHiding: type !== JOBS,
                Cell: ({ row }) => STUDY_TYPES[row.original.studyDesign],
                filterVariant: "select",
                filterSelectOptions: Object.entries(STUDY_TYPES).map(([value, text]) => ({
                    label: text,
                    value,
                })),
                filterFn: (row, columnId, filterValue) => {
                    return row.original[columnId] === filterValue;
                },
            },
            {
                accessorKey: "dataCoverage",
                header: "Data Coverage",
                enableSorting: false,
                enableColumnFilter: isJob,
                maxSize: 40,
                enableHiding: type !== JOBS,
                Cell: ({ row }) => {
                    const i = radioOptionsDatabaseTypes.findIndex(
                        type => type.value === row.original.dataCoverage
                    );
                    return radioOptionsDatabaseTypes[i]?.label;
                },
                filterVariant: "select",
                filterSelectOptions: radioOptionsDatabaseTypes.map(option => ({
                    label: option.text,
                    value: option.value.toString(),
                })),
                filterFn: (row, columnId, filterValue) => {
                    return row.original[columnId]?.toString() === filterValue;
                },
            },
            {
                accessorKey: "statusDescription",
                header: "Status",
                enableSorting: true,
                enableColumnFilter: true,
                filterVariant: "select",
                maxSize: 40,
                Cell: ({ row }) => <GetIconForThisStatus desc={row.original.statusDescription} />,
            },
            {
                accessorKey: "submittedByUserFullName",
                header: "Designed By",
                enableSorting: true,
                enableColumnFilter: true,
                filterVariant: "autocomplete",
                maxSize: 40,
                Cell: ({ row }) => (
                    <Tooltip title={row.original.submittedByUserFullName}>
                        <div style={{ paddingLeft: "25px" }}>
                            <DisplayAvatar
                                value={row.original.submittedByUserFullName}
                                randomColor={true}
                                size="small"
                                fontSize="0.75rem"
                            />
                        </div>
                    </Tooltip>
                ),
            },
        ],
        [type, isJob, studyDownloadAccess, isAdmin, readOnly, isActiveClient, higherAccess]
    );

    const tableData = useMemo(() => {
        return addSlNo(data);
    }, [data]);

    return (
        <>
            <MaterialReactTable
                columns={columns}
                initialState={{
                    density: "compact",
                    columnVisibility: {
                        id: type === JOBS,
                        studyDesign: type === JOBS,
                        databaseName: type === JOBS,
                        dataCoverage: type === JOBS,
                    },
                }}
                data={tableData}
                enableColumnFilters={tableData?.length > 0}
                enableSorting={tableData?.length > 0}
                enableColumnActions={tableData?.length > 0}
                showGlobalFilter={tableData?.length > 0}
                {...baseMRTOptions}
                renderTopToolbarCustomActions={() => {
                    return <MRTDataTableTitle title={props.showAddOnIcon ? "Studies" : "Addons"} />;
                }}
                enableRowActions={true}
                renderRowActions={({ row }) => {
                    const rowData = row.original;

                    const isAnalyticsEnabled = rowData?.clientDbAnalyticsAllowed;

                    const studyDesign = rowData?.studyDesign;

                    const isIncPrevalenceStudy = studyDesign === INC_PREV;

                    const resultsReady =
                        rowData?.status === JOB_STATUS.COMPLETED &&
                        rowData?.analyticsStatus === ANALYTICS_JOB_STATUS.COMPLETED;

                    const title = isIncPrevalenceStudy ? "Analytics" : "Results";

                    const isAnalyticsOrResultsDisabled = !isAnalyticsEnabled ? true : !resultsReady;

                    const handleAnalytics = () => {
                        navigate("/analytics");
                        commonAnalyticsStore.setJobID(rowData?.jobID);
                        commonAnalyticsStore.setProjectID(rowData?.projectID);
                    };

                    const handleDownloadHTML = async () => {
                        downloadHTML(rowData?.projectID, rowData?.jobID, type);
                    };

                    const displayAnalyticsOrResultsIcon = isIncPrevalenceStudy
                        ? isJob
                        : props.showAddOnIcon;

                    const handleOnClick = isIncPrevalenceStudy
                        ? handleAnalytics
                        : handleDownloadHTML;

                    const disableReload =
                        ((rowData?.status !== 3 || rowData?.status !== 4) && !higherAccess) ||
                        !isActiveClient ||
                        !projectDetails.activeProject;

                    const disableDownload =
                        ((!isAdmin || rowData?.status !== 3) &&
                            (readOnly || rowData?.status !== 3)) ||
                        !isActiveClient ||
                        !projectDetails.activeProject;

                    return (
                        <div>
                            {displayAnalyticsOrResultsIcon && (
                                <Tooltip title={title} aria-label={title}>
                                    <span>
                                        <IconButton
                                            disabled={isAnalyticsOrResultsDisabled}
                                            onClick={() => handleOnClick()}
                                        >
                                            <AssessmentIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                            {
                                <Tooltip
                                    title="Study Design and Summary"
                                    aria-label="Study Design and Summary"
                                >
                                    <span>
                                        <IconButton
                                            disabled={rowData?.status === JOB_STATUS.ARCHIVED}
                                            onClick={async () => {
                                                setRowSelected(rowData);
                                                setResults(true);
                                            }}
                                        >
                                            <ListAltOutlinedIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            }
                            {studyDownloadAccess && (
                                <Tooltip
                                    title={
                                        !projectDetails.activeProject ? (
                                            <span>
                                                <ErrorOutlineIcon
                                                    size="small"
                                                    color="error"
                                                    sx={{ verticalAlign: "middle" }}
                                                />{" "}
                                                <font style={{ fontSize: "12px" }}>
                                                    {ARCHIVED_PROJECT_MSG}
                                                </font>
                                            </span>
                                        ) : (
                                            "Download"
                                        )
                                    }
                                    aria-label="Download"
                                >
                                    <span>
                                        <IconButton
                                            disabled={disableDownload}
                                            onClick={async () => {
                                                download(
                                                    rowData?.projectID,
                                                    rowData?.jobID,
                                                    type,
                                                    rowData
                                                );
                                            }}
                                        >
                                            {rowData && <CloudDownloadOutlinedIcon download />}
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                            {
                                <Tooltip
                                    title={
                                        !projectDetails.activeProject ? (
                                            <span>
                                                <ErrorOutlineIcon
                                                    size="small"
                                                    color="error"
                                                    sx={{ verticalAlign: "middle" }}
                                                />{" "}
                                                <font style={{ fontSize: "12px" }}>
                                                    {ARCHIVED_PROJECT_MSG}
                                                </font>
                                            </span>
                                        ) : rowData?.status === JOB_STATUS.DRAFT &&
                                          rowData?.submittedByUserID === session.loggedInUser ? (
                                            "Resume"
                                        ) : (
                                            "Reload"
                                        )
                                    }
                                    aria-label="Reload"
                                >
                                    <span>
                                        <IconButton
                                            disabled={disableReload}
                                            onClick={event => {
                                                if (props.showAddOnIcon !== true) {
                                                    // Then we are loading AddOn
                                                    props.setMode(
                                                        event,
                                                        rowData?.jobID,
                                                        rowData?.studyDesign,
                                                        "load"
                                                    );
                                                } else {
                                                    // We are loading a job.
                                                    props.handleClickOpen(
                                                        event,
                                                        rowData?.jobID,
                                                        undefined,
                                                        "dummy",
                                                        rowData?.id
                                                    );
                                                }
                                            }}
                                        >
                                            {rowData?.status === JOB_STATUS.DRAFT &&
                                            rowData?.submittedByUserID === session.loggedInUser ? (
                                                <PlayArrowOutlined />
                                            ) : (
                                                <RefreshIcon />
                                            )}
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            }

                            <>
                                <Tooltip title="More actions" aria-label="More actions">
                                    <IconButton onClick={event => openMenu(event, rowData)}>
                                        <MoreHorizIcon />
                                    </IconButton>
                                </Tooltip>
                            </>
                        </div>
                    );
                }}
            />

            <ContextMenu />

            {open && <AddOns data={rowSelected} {...addOnsProps} />}
            {results && <ShowResults data={rowSelected} {...showResultsProps} />}
            {showFullDbDialog && (
                <FullDatabaseRequestDialog
                    open={showFullDbDialog}
                    handleClose={() => setShowFullDbDialog(false)}
                    studyData={rowSelectedForMenu}
                    projectId={rowSelectedForMenu.projectID}
                    jobId={rowSelectedForMenu.jobID}
                />
            )}
            {showManageProtocolDialog && (
                <ManageProtocolDialog
                    open={showManageProtocolDialog}
                    handleClose={() => setShowManageProtocolDialog(false)}
                    studyData={rowSelectedForMenu}
                    projectId={rowSelectedForMenu.projectID}
                />
            )}
        </>
    );
});

const AddOns = observer(props => {
    const { data, open, handleClose } = props;

    React.useEffect(() => {
        (async () => {
            await projectDetails.getAddons(data?.jobID, data?.projectID);
        })();
    }, []);

    return (
        <Dialog
            fullWidth={true}
            maxWidth="lg"
            disableEscapeKeyDown
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={open}
            onClose={(event, reason) => {
                if (reason !== "backdropClick") {
                    handleClose(event, reason);
                }
            }}
            closeAfterTransition
            slots={{
                backdrop: Backdrop,
            }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
                Additional variables for {data?.jobName}
                <BasicButton handleClick={() => handleClose(false)} buttonText="Close" />
            </DialogTitle>
            <DialogContent>
                <div style={{ marginTop: "10px" }}>
                    <ShowTable {...props} data={projectDetails.addonList} showAddOnIcon={false} />
                </div>
            </DialogContent>
        </Dialog>
    );
});

const ShowResults = observer(props => {
    const [results, setResults] = React.useState({});
    const { rowSelected } = props;
    const [value, setValue] = React.useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    React.useEffect(() => {
        commonJobsStore.resetAllStores();
        (async () => {
            const data = await projectDetails.viewResults(
                rowSelected.projectID,
                props.type === "addons" ? rowSelected.jobID : rowSelected.id,
                props.type
            );
            commonJobsStore.loadSummary(data);
            setResults(data);
        })();
    }, [rowSelected.projectID, rowSelected.id, props.type]);

    const { open, handleClose } = props;

    const useStyles = makeStyles(theme => ({
        modal: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            // transform: translate("-50%", "-50%"),
        },
        paper: {
            backgroundColor: theme.palette.background.paper,
            border: "1px solid #424242",
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
            zIndex: "inherit",
        },
        row: {
            display: "flex",
        },
        column: {
            flex: "50%",
            fontWeight: "bold",
            margin: "10px",
        },
        columnInfo: {
            flex: "50%",
        },

        extract: {
            marginTop: "10px",
        },
        fixedWidth: {
            color: theme.palette.text.primary,
            maxWidth: "100%",
            width: "100%",
            outline: "none",
            border: "none",
        },
    }));

    const classes = useStyles();

    if (projectDetails.loading) {
        return "Loading..";
    }

    const maxRows2 = () => {
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        if (vh > 1500) {
            return 70;
        } else if (vh > 1300) {
            return 60;
        } else if (vh > 1200) {
            return 56;
        } else if (vh > 1100) {
            return 52;
        } else if (vh > 1000) {
            return 45;
        } else if (vh > 900) {
            return 40;
        } else if (vh > 821) {
            return 36;
        } else if (vh > 710) {
            return 29;
        } else if (vh > 610) {
            return 23;
        } else if (vh > 550) {
            return 20;
        } else if (vh > 400) {
            return 11;
        } else {
            return 5;
        }
    };

    return (
        <Modal
            disableEscapeKeyDown
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={open}
            onClose={handleClose}
            closeAfterTransition
            slots={{
                backdrop: Backdrop,
            }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Fade in={open}>
                <div
                    className={classes.paper}
                    style={{ zIndex: "inherit", width: "80%", height: "90%", overflowY: "auto" }}
                >
                    <Container component="main" fixed maxWidth={false}>
                        <Grid container spacing={1}>
                            <Grid
                                size={{
                                    xs: 10,
                                    md: 10,
                                    lg: 10,
                                }}
                            >
                                <Typography variant="h5" title="Study Design and Summary">
                                    Study Design and Summary
                                </Typography>
                            </Grid>
                            <Grid
                                style={{
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    display: "flex",
                                }}
                                size={{
                                    xs: 2,
                                    md: 2,
                                    lg: 2,
                                }}
                            >
                                <div>
                                    <BasicButton
                                        handleClick={() => handleClose(false)}
                                        buttonText="Close"
                                    />
                                </div>
                            </Grid>
                        </Grid>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            textColor="secondary"
                            indicatorColor="secondary"
                            aria-label="secondary tabs example"
                        >
                            <Tab label="Summary" {...a11yProps(0)} />
                            <Tab label="Design" {...a11yProps(1)} />
                            <Tab label="Time" {...a11yProps(2)} />
                        </Tabs>
                        <TabPanel value={value} index={0}>
                            {results?.dataExtractionReport ? (
                                <Card className={classes.extract} variant="elevation">
                                    <DataExtractionReport data={results.dataExtractionReport} />
                                </Card>
                            ) : (
                                <Card className={classes.extract} variant="elevation">
                                    <TextareaAutosize
                                        maxRows={maxRows2()}
                                        value={formatTextForResults(results?.results)}
                                        defaultValue={"Nothing to show"}
                                        className={classes.fixedWidth}
                                        disabled={true}
                                    />
                                </Card>
                            )}
                        </TabPanel>
                        <TabPanel value={value} index={1}>
                            <SummaryDetails />
                        </TabPanel>
                        <TabPanel value={value} index={2}>
                            <Card className={classes.root} variant="elevation">
                                <div className={classes.row}>
                                    <div className={classes.column}> Job Submitted On</div>
                                    <div className={classes.column}>
                                        {formatDate(results.submittedOn)}
                                    </div>
                                    <div className={classes.column}> Wait Time</div>
                                    <div className={classes.column}> {results.waitTime}</div>
                                </div>

                                <div className={classes.row}>
                                    <div className={classes.column}> Extraction Started On</div>
                                    <div className={classes.column}>
                                        {" "}
                                        {formatDate(results.startedOn)}
                                    </div>
                                    <div className={classes.column}> Run Time</div>
                                    <div className={classes.column}> {results.runTime}</div>
                                </div>

                                <div className={classes.row}>
                                    <div className={classes.column}> Extraction Completed On</div>
                                    <div className={classes.column}>
                                        {" "}
                                        {formatDate(results.completedOn)}
                                    </div>
                                    <div className={classes.column}> Total Time</div>
                                    <div className={classes.column}> {results.totalTime}</div>
                                </div>
                            </Card>
                        </TabPanel>
                    </Container>
                </div>
            </Fade>
        </Modal>
    );
});
