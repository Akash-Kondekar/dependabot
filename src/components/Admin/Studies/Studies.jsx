import React, { useMemo } from "react";
import {
    baseMRTOptions,
    FULL_DB_EXTRACTION,
    GetIconForThisStatus,
    JOB_STATUS,
    JOBS,
    PROTOCOL_MANDATORY,
    PROTOCOL_OPTIONAL,
} from "../../../constants";
import { addSlNo } from "../../../utils";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { CancelOutlined, CheckOutlined } from "@mui/icons-material";
import { Copy, DisplayAvatar, Dropdown, ShowSuccess } from "../../Common";
import session from "../../../state/store/session";
import adminJobs from "../../../state/store/admin/jobs";
import ArticleIcon from "@mui/icons-material/Article";
import { Backdrop, Chip, Stack } from "@mui/material";
import { SummaryDetails } from "../../Study/Summary/SummaryDialog.jsx";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import commonJobsStore from "../../../state/store/study/common.js";
import projectDetails from "../../../state/store/projects/details.js";
import Grid from "@mui/material/Grid2";
import CircularProgress from "@mui/material/CircularProgress";
import studyProtocol from "../../../state/store/studyProtocol.js";
import Box from "@mui/material/Box";
import { MaterialReactTable } from "material-react-table";
import { MRTDataTableTitle } from "../../Common/MRTDataTableTitle.jsx";
import { Confirm } from "../../../componentsV2/Common/Confirm";

const PRIORITY_LIST = [
    { value: "0", label: "Low" },
    { value: "1", label: "Normal" },
    { value: "2", label: "High" },
    { value: "3", label: "Highest" },
];

export const Studies = ({ results, updateStatus, updatePriority, jobType }) => {
    return (
        <div>
            <DisplayStudies
                results={results}
                studyStatus={FULL_DB_EXTRACTION}
                updateStatus={updateStatus}
                updatePriority={updatePriority}
                jobType={jobType}
            />
        </div>
    );
};

export const DisplayStudies = ({ results, _, updateStatus, updatePriority, jobType }) => {
    const { isAdmin } = session;
    const filterDataAndAddSlNo = data => {
        return addSlNo(data);
    };
    const [loading, setLoading] = React.useState(-1);
    const [pdfUrl, setPdfUrl] = React.useState("");
    const [showSummaryData, setShowSummaryData] = React.useState(false);
    const [studyData, setStudyData] = React.useState(null);
    const columns = [
        {
            accessorKey: "slNo",
            header: "Sl No",
            enableColumnActions: false,
            enableColumnFilter: false,
            enableSorting: false,
            maxSize: 30,
        },
        {
            accessorKey: "id",
            header: "ID",
            enableColumnActions: false,
            enableColumnFilter: false,
            enableSorting: false,
            maxSize: 30,
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
            accessorKey: "projectID",
            header: "Project ID",
            enableColumnActions: false,
            enableColumnFilter: false,
            enableSorting: false,
            maxSize: 30,
        },
        {
            accessorKey: "projectName",
            header: "Project Name",
            filterFn: "contains",
        },
        {
            accessorKey: "jobID",
            header: "Study ID",
            enableColumnActions: false,
            enableColumnFilter: false,
            enableSorting: false,
            maxSize: 30,
        },
        {
            accessorKey: "jobName",
            header: "Study Name",
            filterFn: "contains",
        },
        {
            accessorKey: "statusDescription",
            header: "Status",
            Cell: ({ cell }) => {
                const value = cell.getValue();
                return <GetIconForThisStatus desc={value} />;
            },
            filterVariant: "select",
            maxSize: 30,
        },
        {
            accessorKey: "priority",
            header: "Priority",
            filterVariant: "select",
            filterSelectOptions: PRIORITY_LIST,
            Cell: ({ row }) => {
                const rowData = row.original;
                return (
                    <div>
                        {isAdmin ? (
                            <Dropdown
                                ddLabel="" // Empty since the table header already has a label
                                labelName="Priority"
                                labelValue="" // Empty since the table header already has a label
                                value={rowData.priority}
                                handleChange={async e => {
                                    const { isConfirmed } = await Confirm(
                                        "Update Priority",
                                        "Are you sure you want to change the priority?"
                                    );
                                    if (isConfirmed) {
                                        const success = updatePriority(
                                            rowData.projectID,
                                            rowData.jobID,
                                            e.target.value,
                                            rowData.type
                                        );
                                        success && ShowSuccess("Priority changed successfully");
                                    }
                                }}
                                dropdownOptions={PRIORITY_LIST}
                            />
                        ) : (
                            <span>{rowData.priorityDescription}</span>
                        )}
                    </div>
                );
            },
            maxSize: 30,
        },
        {
            accessorKey: "submittedByUserFullName",
            header: "Designed By",
            filterVariant: "autocomplete",
            Cell: ({ row }) => (
                <>
                    <Tooltip title={row.original.submittedByUserFullName}>
                        <Stack sx={{ alignItems: "center" }}>
                            <DisplayAvatar
                                value={row.original.submittedByUserFullName}
                                randomColor={true}
                                size="small"
                                fontSize="0.75rem"
                            />
                        </Stack>
                    </Tooltip>
                </>
            ),
            maxSize: 30,
        },
        {
            accessorKey: "protocolRequired",
            header: "Protocol Required",
            filterVariant: "select",
            filterSelectOptions: [
                { label: "Mandatory", value: "true" },
                { label: "Optional", value: "false" },
            ],
            Cell: ({ cell }) => {
                const value = cell.getValue();
                return (
                    <Chip
                        color={value === true ? "error" : "info"}
                        variant="outlined"
                        label={value === true ? PROTOCOL_MANDATORY : PROTOCOL_OPTIONAL}
                    />
                );
            },
        },
    ];

    async function getStudySummaryAndPDF(show, rowData) {
        setLoading(rowData.id);
        commonJobsStore.resetAllStores();
        const data = await projectDetails.viewResults(rowData.projectID, rowData.id, "job");
        setStudyData(data?.studyObject?.studyPeriod?.opFilename);
        // Load data into the store
        await commonJobsStore.loadSummary(data);
        // Load protocol PDF
        const pdf = await studyProtocol.downloadProtocolForJobId(rowData.id);
        setPdfUrl(pdf);
        // Show the dialog
        setShowSummaryData(show);
        setLoading(-1);
    }

    // Converted MRT columns
    const adminStudiesColumns = useMemo(() => {
        if (jobType === JOBS) {
            return columns;
        } else {
            const keysToRemove = ["id", "protocolRequired"];
            return columns.filter(column => !keysToRemove.includes(column.accessorKey));
        }
    }, []);

    // MRT options combining base options with custom functionality
    const mrtOptions = {
        ...baseMRTOptions,
        initialState: { density: "compact" },
        enableRowActions: isAdmin,
        renderRowActions: ({ row }) => {
            const rowData = row.original;
            const isJob = rowData.type.toLowerCase() === JOBS;

            return (
                <Box sx={{ display: "flex", gap: "0.5rem" }}>
                    {/* Approve Request Button - only show for jobs with status 7 */}
                    {isJob && rowData.status === 7 && (
                        <Tooltip title="Approve Request" aria-label="Approve Request">
                            <IconButton
                                onClick={async () => {
                                    const { isConfirmed } = await Confirm(
                                        "Full DB Extraction Request",
                                        "Are you sure you want to Approve this Full DB Extraction Request"
                                    );
                                    if (isConfirmed) {
                                        const success = updateStatus(
                                            rowData.projectID,
                                            rowData.jobID,
                                            JOB_STATUS.QUEUE,
                                            rowData.type
                                        );
                                        success && ShowSuccess(" Full DB Request approved");
                                    }
                                }}
                            >
                                <CheckOutlined />
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* View Protocol Button - only show for jobs with status 7 */}
                    {isJob && rowData.status === 7 && (
                        <Tooltip
                            title="View protocol and study design"
                            aria-label="View protocol and study design"
                        >
                            <IconButton
                                onClick={async () => {
                                    getStudySummaryAndPDF(true, rowData);
                                }}
                            >
                                {loading === rowData.id ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <ArticleIcon />
                                )}
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* Reject Request Button - always show */}
                    <Tooltip title="Reject Request" aria-label="Reject Request">
                        <IconButton
                            onClick={async () => {
                                const { isConfirmed } = await Confirm(
                                    "Reject Request",
                                    "Are you sure you want to Reject this Request"
                                );
                                if (isConfirmed) {
                                    const success = isJob
                                        ? updateStatus(
                                              rowData.projectID,
                                              rowData.jobID,
                                              JOB_STATUS.CANCELLED,
                                              rowData.type
                                          )
                                        : adminJobs.cancelAddon(rowData.projectID, rowData.jobID);
                                    const message = isJob
                                        ? "Job request declined"
                                        : "Addon request declined";
                                    success && ShowSuccess(message);
                                }
                            }}
                        >
                            <CancelOutlined />
                        </IconButton>
                    </Tooltip>
                </Box>
            );
        },
    };

    return (
        <>
            <MaterialReactTable
                columns={adminStudiesColumns}
                data={filterDataAndAddSlNo(results)}
                enableColumnFilters={results?.length > 0}
                enableSorting={results?.length > 0}
                enableColumnActions={results?.length > 0}
                showGlobalFilter={results?.length > 0}
                {...mrtOptions}
                renderTopToolbarCustomActions={() => {
                    return <MRTDataTableTitle title="In Queue" />;
                }}
            />
            {showSummaryData && (
                <DisplayProtocolAndSummaryDialog
                    showSummaryData={showSummaryData}
                    setShowSummaryData={setShowSummaryData}
                    pdfUrl={pdfUrl}
                    studyData={studyData} // Pass study data directly if needed
                />
            )}
        </>
    );
};

export const DisplayProtocolAndSummaryDialog = ({
    showSummaryData,
    setShowSummaryData,
    pdfUrl,
    studyData,
}) => {
    const descriptionElementRef = React.useRef(null);
    React.useEffect(() => {
        if (showSummaryData) {
            const { current: descriptionElement } = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [showSummaryData, studyData]);

    const handleClose = () => {
        URL.revokeObjectURL(pdfUrl);
        setShowSummaryData(false);
    };

    return (
        <Dialog
            maxWidth="xl"
            fullWidth={true}
            open={showSummaryData}
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
            <DialogContent>
                <Grid container spacing={1}>
                    <Grid size={6}>
                        <SummaryDetails descriptionElementRef={descriptionElementRef} />
                    </Grid>
                    <Grid size={6}>
                        {pdfUrl && (
                            <iframe
                                src={pdfUrl}
                                title="PDF Viewer"
                                width="100%"
                                height="100%"
                                style={{ border: "none" }}
                            />
                        )}
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};
