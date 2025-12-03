import React, { useMemo, useState } from "react";
import {
    ANALYTICS_JOB_STATUS,
    ARCHIVED_PROJECT_MSG,
    baseMRTOptions,
    GetIconForThisStatus,
    INC_PREV,
    JOB_STATUS,
    JOBS,
    PROJECT_ROLE,
    radioOptionsDatabaseTypes,
    SESSION_EXPIRED,
    STUDY_TYPES,
} from "../../constants";

import { ListItemIcon, ListItemText, Stack } from "@mui/material";

import { addSlNo } from "../../utils";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AddIcon from "@mui/icons-material/Add";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import projectDetails from "../../state/store/projects/details";
import { observer } from "mobx-react";
import session from "../../state/store/session";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import user from "../../state/store/user";
import commonJobsStore from "../../state/store/study/common";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { MaterialReactTable } from "material-react-table";
import { Copy } from "../Common/Clipboard.jsx";
import { DisplayAvatar } from "../Common/Avatar.jsx";
import { MRTDataTableTitle } from "../../components/Common/MRTDataTableTitle.jsx";
import FullDatabaseRequestDialog from "./FullDatabaseRequestDialog.jsx";
import { SummaryDetails } from "../Study/Summary/SummaryDetails.jsx";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useTheme } from "@mui/material/styles";
import {
    AssessmentOutlined,
    DownloadOutlined,
    PlayArrowOutlined,
    SchemaOutlined,
    Timeline,
    VisibilityOutlined,
} from "@mui/icons-material";
import { DialogBox } from "../Common/DialogBox.jsx";
import Box from "@mui/material/Box";
import DataExtractionReport from "../../components/Study/Analytics/DataExtractionReport/index.jsx";
import Card from "@mui/material/Card";
import { StudyTimeline } from "./StudyTimeline.jsx";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { ShowError, ShowSuccess } from "../Common/Toast.jsx";
import { Confirm } from "../Common/Confirm.jsx";

export const ProjectStudiesTable = observer(props => {
    return (
        <Box m={1}>
            <ShowTable {...props} showAddOnIcon={true} />
        </Box>
    );
});

const ShowTable = observer(props => {
    const [rowSelected, setRowSelected] = React.useState({});
    const [open, setOpen] = React.useState(false); // Addons Modal
    const [results, setResults] = React.useState(false); // DataExtractionReport Modal
    const [extractSummary, setExtractSummary] = React.useState(false); // DataExtractionReport Dialog
    const [rowSelectedForMenu, setRowSelectedForMenu] = React.useState({});
    const [showFullDbDialog, setShowFullDbDialog] = React.useState(false);
    const [showStudyTimeLine, setShowStudyTimeLine] = React.useState(false);
    const [loadingJobs, setLoadingJobs] = useState(projectDetails?.busyLoadingJobs || false);
    const isJob = props.showAddOnIcon === true;
    const type = isJob ? "jobs" : "addons";
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const baseBackgroundColor = isDarkMode ? theme.palette.grey.main : theme.palette.grey.light;
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
    // Highlight selected study row when navigated from dashboard

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
    const readOnly = projectDetails.currentUserProjectRole <= PROJECT_ROLE.VIEW_ONLY;
    const isJobCompleted = rowSelectedForMenu?.status === JOB_STATUS.COMPLETED;
    const isJobCancelled = rowSelectedForMenu?.status === JOB_STATUS.CANCELLED;

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
                                    />
                                    {ARCHIVED_PROJECT_MSG}
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
                                aria-label="Add Variables"
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
                        aria-label="View Addons"
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
                                    />
                                    {ARCHIVED_PROJECT_MSG}
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
                                    />
                                    {ARCHIVED_PROJECT_MSG}
                                </span>
                            ) : (
                                "View Study Timeline"
                            )
                        }
                    >
                        <div>
                            <MenuItem
                                aria-label="View Study Timeline"
                                onClick={() => {
                                    setShowStudyTimeLine(true);
                                    handleCancel();
                                }}
                                disabled={!isActiveClient}
                            >
                                <ListItemIcon>
                                    <Timeline />
                                </ListItemIcon>
                                <ListItemText>View Study Timeline</ListItemText>
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
                                    />
                                    {ARCHIVED_PROJECT_MSG}
                                </span>
                            ) : (
                                "Download all clinical codes present in this study"
                            )
                        }
                    >
                        <div>
                            <MenuItem
                                aria-label="Download Study codelists"
                                onClick={() => {
                                    downloadStudyCodeLists(
                                        rowSelectedForMenu?.projectID,
                                        rowSelectedForMenu?.id,
                                        true
                                    );
                                }}
                                disabled={!isActiveClient}
                            >
                                <ListItemIcon>
                                    <DownloadOutlined />
                                </ListItemIcon>
                                <ListItemText>Download Study codelists</ListItemText>
                            </MenuItem>
                        </div>
                    </Tooltip>
                </>
            );
        };

        return (
            <>
                <Menu
                    id="View-more-options-menu"
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
                                    />
                                    {ARCHIVED_PROJECT_MSG}
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
                                aria-label="Cancel"
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
                                    <CancelOutlinedIcon />
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
                                    />
                                    {ARCHIVED_PROJECT_MSG}
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
                                aria-label="Delete"
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
                                    <DeleteOutlineOutlinedIcon />
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
                accessorKey: "id",
                header: "ID",
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                maxSize: 40,
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
                maxSize: 30,
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
                header: "Design",
                enableSorting: isJob,
                enableColumnFilter: isJob,
                maxSize: 30,
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
                maxSize: 30,
                muiTableBodyCellProps: {
                    align: "left",
                },
                Cell: ({ row }) => <GetIconForThisStatus desc={row.original.statusDescription} />,
            },
            {
                accessorKey: "submittedByUserFullName",
                header: "Owner",
                enableSorting: true,
                enableColumnFilter: true,
                filterVariant: "autocomplete",
                muiTableHeadCellProps: {
                    align: "left",
                },
                muiTableBodyCellProps: {
                    align: "left",
                },
                maxSize: 30,
                Cell: ({ row }) => (
                    <Tooltip title={row.original.submittedByUserFullName}>
                        <div>
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

    React.useEffect(() => {
        setLoadingJobs(projectDetails.busyLoadingJobs === true);
    }, [projectDetails.busyLoadingJobs]);

    const tableData = useMemo(() => {
        return addSlNo(data);
    }, [data]);

    const hasData = tableData?.length > 0;
    const [highlightedJobId, setHighlightedJobId] = React.useState(null);
    React.useEffect(() => {
        if (props.highlightJobId && tableData.length > 0) {
            setHighlightedJobId(props.highlightJobId);
            const timer = setTimeout(() => {
                setHighlightedJobId(null);
                // Notify parent that highlight is done
                if (typeof props.onHighlightUsed === "function") {
                    props.onHighlightUsed();
                }
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [props.highlightJobId, hasData]);

    const downloadStudyCodeLists = async (projectId, jobId, type) => {
        const content = await projectDetails.downloadStudyCodeLists(projectId, jobId, type);
        if (content) {
            const url = window.URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = rowSelectedForMenu?.jobName + ".zip";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        }
    };

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
                state={{ showSkeletons: loadingJobs, highlightedRow: highlightedJobId }}
                data={tableData}
                enableColumnFilters={hasData}
                enableSorting={hasData}
                enableColumnActions={hasData}
                showGlobalFilter={hasData}
                {...baseMRTOptions}
                muiTableBodyRowProps={({ row }) => {
                    const isHighlighted =
                        highlightedJobId && row?.original?.id === highlightedJobId;
                    return {
                        sx: {
                            ...(isHighlighted && {
                                backgroundColor: `${theme.palette.primary.main} !important`,
                                transition: "background-color 0.5s ease",
                                "&:hover": {
                                    backgroundColor: `${theme.palette.primary.main} !important`,
                                },
                            }),
                            "&:hover .copy-button": {
                                visibility: "visible",
                            },
                        },
                    };
                }}
                renderTopToolbarCustomActions={() => {
                    return <MRTDataTableTitle title={props.showAddOnIcon ? "" : "Addons"} />;
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

                    const analyticsButtonTitle = isIncPrevalenceStudy ? "Analytics" : "Results";

                    const isAnalyticsOrResultsDisabled = !isAnalyticsEnabled ? true : !resultsReady;

                    const handleAnalytics = () => {
                        //TODO: enable once analytics is implemented
                        /*navigate("/analytics");*/
                        navigate("/coming-soon");
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
                                <Tooltip title={analyticsButtonTitle}>
                                    <span>
                                        <IconButton
                                            aria-label={analyticsButtonTitle}
                                            disabled={isAnalyticsOrResultsDisabled}
                                            onClick={() => handleOnClick()}
                                        >
                                            <AssessmentOutlined />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                            {
                                <Tooltip title="View Study Design">
                                    <span>
                                        <IconButton
                                            aria-label="View Study Design"
                                            disabled={rowData?.status === JOB_STATUS.ARCHIVED}
                                            onClick={async () => {
                                                setRowSelected(rowData);
                                                setResults(true);
                                            }}
                                        >
                                            <VisibilityOutlined />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            }
                            {
                                <Tooltip title="View Data Extraction Summary">
                                    <span>
                                        <IconButton
                                            aria-label="View Data Extraction Summary"
                                            disabled={rowData?.status !== JOB_STATUS.COMPLETED}
                                            onClick={async () => {
                                                setRowSelected(rowData);
                                                setExtractSummary(true);
                                            }}
                                        >
                                            <SchemaOutlined />
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
                                                />
                                                {ARCHIVED_PROJECT_MSG}
                                            </span>
                                        ) : (
                                            "Download"
                                        )
                                    }
                                >
                                    <span>
                                        <IconButton
                                            aria-label="Download"
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
                                                />
                                                {ARCHIVED_PROJECT_MSG}
                                            </span>
                                        ) : rowData?.status === JOB_STATUS.DRAFT &&
                                          rowData?.submittedByUserID === session.loggedInUser ? (
                                            "Resume"
                                        ) : (
                                            "Reload"
                                        )
                                    }
                                >
                                    <span>
                                        <IconButton
                                            aria-label="Reload"
                                            disabled={disableReload}
                                            onClick={
                                                (/*event*/) => {
                                                    navigate("/coming-soon");
                                                    //TODO: enalbe in 651
                                                    /*if (props.showAddOnIcon !== true) {
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
                                                        "dummy"
                                                    );
                                                }*/
                                                }
                                            }
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
                                <Tooltip title="More actions">
                                    <IconButton
                                        onClick={event => openMenu(event, rowData)}
                                        aria-label="More actions"
                                    >
                                        <MoreHorizIcon />
                                    </IconButton>
                                </Tooltip>
                            </>
                        </div>
                    );
                }}
                muiTablePaperProps={{
                    elevation: 0, //change the mui box shadow
                    //customize paper styles
                    sx: {
                        borderRadius: "32px",
                        border: "0",
                    },
                }}
                mrtTheme={() => ({
                    baseBackgroundColor: baseBackgroundColor,
                })}
            />

            <ContextMenu />

            {open && <AddOns data={rowSelected} {...addOnsProps} />}
            {results && <ShowResults data={rowSelected} {...showResultsProps} />}
            {extractSummary && (
                <ShowDataExtractionSummary
                    data={rowSelected}
                    setMode={props.setMode}
                    handleClickOpen={props.handleClickOpen}
                    handleClose={setExtractSummary}
                    open={extractSummary}
                    rowSelected={rowSelected}
                    type={type}
                />
            )}
            {showFullDbDialog && (
                <FullDatabaseRequestDialog
                    open={showFullDbDialog}
                    handleClose={() => setShowFullDbDialog(false)}
                    studyData={rowSelectedForMenu}
                    projectId={rowSelectedForMenu.projectID}
                    jobId={rowSelectedForMenu.jobID}
                />
            )}
            {showStudyTimeLine && (
                <StudyTimeline
                    open={showStudyTimeLine}
                    handleClose={() => setShowStudyTimeLine(false)}
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
        <DialogBox
            open={open}
            handleClose={() => handleClose(false)}
            maxWidth="lg"
            fullWidth={true}
            title={`Additional variables for ${data?.jobName}`}
            Content={
                <div style={{ marginTop: "10px" }}>
                    <ShowTable {...props} data={projectDetails.addonList} showAddOnIcon={false} />
                </div>
            }
        />
    );
});

export const ShowResults = observer(props => {
    const { rowSelected } = props;
    const [dataLoaded, setDataLoaded] = React.useState(false);
    React.useEffect(() => {
        setDataLoaded(false);
        commonJobsStore.resetAllStores();
        (async () => {
            const data = await projectDetails.viewResults(
                rowSelected.projectID,
                props.type === "addons" ? rowSelected.jobID : rowSelected.id,
                props.type
            );
            commonJobsStore.loadSummary(data);
            setDataLoaded(true);
        })();
    }, [rowSelected.projectID, rowSelected.jobID, props.type]);

    const { open, handleClose } = props;

    if (projectDetails.loading || !dataLoaded) {
        return "Loading..";
    }

    return (
        <DialogBox
            maxWidth="xl"
            fullWidth={true}
            title="Study Design"
            Content={<SummaryDetails />}
            open={open}
            handleClose={() => handleClose(false)}
        />
    );
});

export const ShowDataExtractionSummary = observer(props => {
    const [results, setResults] = React.useState({});
    const { rowSelected } = props;

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
    }, [rowSelected.projectID, rowSelected.jobID, props.type]);

    const { open, handleClose } = props;

    if (projectDetails.loading) {
        return "Loading..";
    }

    const formatStudyResults = text => {
        // Split into sentences but preserve numbered items
        const parts = text?.split(/(?<=\.)\s+(?=\d+\)\s|[A-Z])/);

        const formatted = [];
        parts?.forEach(part => {
            // Check if this part contains numbered items (with space after ")")
            const hasNumberedItems = /\d+\)\s\d+/.test(part);

            if (hasNumberedItems) {
                // Split the intro text from the numbered items
                const splitPoint = part.search(/\d+\)\s/);
                const intro = part.substring(0, splitPoint).trim();
                const itemsText = part.substring(splitPoint);

                if (intro) {
                    formatted.push({ type: "paragraph", content: intro });
                }

                // Extract numbered items - require space after ")"
                const items = itemsText.match(/\d+\)\s+[^.]+\./g) || [];
                formatted.push({
                    type: "list",
                    items: items.map(item => item.trim()),
                });
            } else {
                formatted.push({ type: "paragraph", content: part.trim() });
            }
        });

        return formatted;
    };

    const StudyResultsCard = ({ text }) => {
        const formattedContent = formatStudyResults(text);

        return (
            <Box>
                {formattedContent.map((section, idx) => (
                    <Box key={idx} sx={{ mb: section.type === "list" ? 3 : 2 }}>
                        {section.type === "paragraph" ? (
                            <Typography variant="body1">{section.content}</Typography>
                        ) : (
                            <Box sx={{ pl: 2 }}>
                                {section.items.map((item, itemIdx) => (
                                    <Typography
                                        key={itemIdx}
                                        variant="subtitle2"
                                        sx={{
                                            color: "text.secondary",
                                        }}
                                    >
                                        {item}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                    </Box>
                ))}
            </Box>
        );
    };

    const content = (
        <Box sx={{ p: 3 }}>
            {results?.dataExtractionReport ? (
                <Card variant="elevation">
                    <DataExtractionReport data={results.dataExtractionReport} />
                </Card>
            ) : (
                <StudyResultsCard text={results?.results} />
            )}
        </Box>
    );

    return (
        <DialogBox
            maxWidth="xl"
            fullWidth={true}
            title={`Data Extraction Summary: ${rowSelected.jobName}`}
            Content={content}
            open={open}
            handleClose={() => handleClose(false)}
        />
    );
});
