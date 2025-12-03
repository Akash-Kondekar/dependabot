import React, { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Backdrop from "@mui/material/Backdrop";
import Paper from "@mui/material/Paper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import studyProtocolStore from "../../state/store/studyProtocol";
import { MaterialReactTable } from "material-react-table";
import Box from "@mui/material/Box";
import { formatDateTime, formatFileSize } from "../../utils/index.jsx";
import projectDetails from "../../state/store/projects/details";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import enLocale from "date-fns/locale/en-GB";
import http from "../../lib/http";
import Chip from "@mui/material/Chip";
import {
    CLINICAL_CODELIST_GENERIC_LABEL,
    CLINICAL_CODELIST_MEDICAL_LABEL,
    CLINICAL_CODELIST_THERAPY_LABEL,
} from "../../constants/index.jsx";
import { Confirm, ShowError, ShowSuccess } from "../Common";

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const FullDatabaseRequestDialog = observer(({ open, handleClose, studyData, projectId, jobId }) => {
    const database = projectDetails.listOfUserDatabases.find(
        database => database.name === studyData.databaseName
    );
    const [selectedProtocol, setSelectedProtocol] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [pagination, setPagination] = useState({
        pageIndex: studyProtocolStore.page.page || 0,
        pageSize: studyProtocolStore.page.size || 10,
    });
    const [activeStep, setActiveStep] = useState(0);
    const [modifiedCodes, setModifiedCodes] = useState([]);
    const [isCheckingCodes, setIsCheckingCodes] = useState(false);
    const [studyObject, setStudyObject] = useState(null);
    const [appliedCodes, setAppliedCodes] = useState(new Set());

    const protocols = studyProtocolStore.list || [];
    const loading = studyProtocolStore.loading;
    const pageInfo = studyProtocolStore.page;
    const systemTheme = useTheme();

    const protocolRequired = database?.protocol === true;
    const steps = ["Select Protocol", "Review Code Changes"];

    const debouncedSetSearch = useCallback(
        debounce(value => {
            setDebouncedSearchTerm(value);
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }, 500),
        []
    );

    useEffect(() => {
        debouncedSetSearch(searchTerm);
    }, [searchTerm, debouncedSetSearch]);

    // Load data when the dialog opens or pagination/search term changes
    useEffect(() => {
        if (open) {
            // Reset selection when data reloads ONLY IF the currently selected item is not in the new list
            if (selectedProtocol && !protocols.find(p => p.id === selectedProtocol.id)) {
                setSelectedProtocol(null);
            }
            // Load data using current pagination and debounced search term
            studyProtocolStore.load(pagination.pageIndex, pagination.pageSize, debouncedSearchTerm);
        } else {
            // Optionally reset state when dialog closes
            setSearchTerm("");
            setDebouncedSearchTerm("");
            setSelectedProtocol(null);
            setPagination({ pageIndex: 0, pageSize: 10 });
            setActiveStep(0);
            setModifiedCodes([]);
            setAppliedCodes(new Set());
        }
    }, [open, pagination.pageIndex, pagination.pageSize, debouncedSearchTerm]);

    // Handle search input changes
    const handleSearchChange = event => {
        setSearchTerm(event.target.value);
    };

    // *** Callback to handle row selection changes from MRT ***
    const handleRowSelectionChange = updater => {
        // MRT passes an updater function. We call it with the current state to get the new state.
        const currentSelection = selectedProtocol ? { [selectedProtocol.id]: true } : {};
        const newSelectionState =
            typeof updater === "function" ? updater(currentSelection) : updater;

        const selectedRowId = Object.keys(newSelectionState)[0]; // Get the ID of the selected row

        if (selectedRowId) {
            const newlySelectedProtocol = protocols.find(p => p.id === selectedRowId);
            setSelectedProtocol(newlySelectedProtocol || null);
        } else {
            setSelectedProtocol(null); // Clear selection if no row ID is found
        }
    };

    const handleNext = async () => {
        if (activeStep === 0) {
            // Moving from protocol selection to code review
            setIsCheckingCodes(true);
            try {
                const response = await http.get(
                    `/projects/${projectId}/jobs/${jobId}/compare-codes`
                );
                const codeChanges = response?.data?.data?.clinicalCodes || [];
                setStudyObject(response?.data?.data?.study);

                // There are code changes, move to review step
                setModifiedCodes(codeChanges);
                setActiveStep(1);
                //}
            } catch (_error) {
                ShowError("Failed to check for code changes");
            } finally {
                setIsCheckingCodes(false);
            }
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    const handleApplySingleCode = index => {
        setAppliedCodes(prev => {
            const newSet = new Set(prev || []);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const handleApplyAllCodes = () => {
        const allIndices = modifiedCodes.reduce((acc, code, index) => {
            if (code.lastModifiedOn !== null) {
                acc.push(index);
            }
            return acc;
        }, []);
        setAppliedCodes(new Set(allIndices));
    };

    const handleApplyCodeUpdates = async () => {
        try {
            setIsSubmitting(true);

            // If no codes are selected to apply, proceed without changes
            if (appliedCodes.size === 0) {
                await handleSubmit(null);
                return;
            }

            // Update the studyObject with only the selected modified codes
            const updatedStudyObject = JSON.parse(JSON.stringify(studyObject));

            // Filter to only include codes that user wants to apply
            const codesToApply = modifiedCodes.filter((_, index) => appliedCodes.has(index));

            // Helper function to update code lists in a section
            const updateCodeListInSection = (section, typeKey) => {
                if (!section || !section[typeKey]) return;
                for (let i = 0; i < section[typeKey].length; i++) {
                    const item = section[typeKey][i];
                    const matchingCode = codesToApply.find(
                        code =>
                            code.filename === item.filename &&
                            code.lastModifiedBy === item.lastModifiedBy
                    );

                    if (matchingCode) {
                        // Apply the diff: add new codes and remove deleted codes
                        const updatedCodes = { ...(item.codes || {}) };

                        // Add new codes
                        if (matchingCode.addedCodes) {
                            Object.entries(matchingCode.addedCodes).forEach(([code, desc]) => {
                                updatedCodes[code] = desc;
                            });
                        }

                        // Remove deleted codes
                        if (matchingCode.removedCodes) {
                            Object.keys(matchingCode.removedCodes).forEach(code => {
                                delete updatedCodes[code];
                            });
                        }

                        // Update the item with the modified codes and metadata
                        section[typeKey][i] = {
                            ...item,
                            codes: updatedCodes,
                            lastModifiedOn: matchingCode.lastModifiedOn,
                        };
                    }
                }
            };

            // Update all sections that might contain code lists
            if (updatedStudyObject.studyPeriod?.population) {
                updateCodeListInSection(
                    updatedStudyObject.studyPeriod?.population,
                    CLINICAL_CODELIST_MEDICAL_LABEL
                );
                updateCodeListInSection(
                    updatedStudyObject.studyPeriod?.population,
                    CLINICAL_CODELIST_THERAPY_LABEL
                );
            }
            if (updatedStudyObject.exposed) {
                updateCodeListInSection(
                    updatedStudyObject.exposed,
                    CLINICAL_CODELIST_MEDICAL_LABEL
                );
                updateCodeListInSection(
                    updatedStudyObject.exposed,
                    CLINICAL_CODELIST_THERAPY_LABEL
                );
            }
            if (updatedStudyObject.control) {
                updateCodeListInSection(
                    updatedStudyObject.control,
                    CLINICAL_CODELIST_MEDICAL_LABEL
                );
                updateCodeListInSection(
                    updatedStudyObject.control,
                    CLINICAL_CODELIST_THERAPY_LABEL
                );
            }
            if (updatedStudyObject.baseline) {
                updateCodeListInSection(
                    updatedStudyObject.baseline,
                    CLINICAL_CODELIST_GENERIC_LABEL
                );
            }
            if (updatedStudyObject.outcome) {
                updateCodeListInSection(
                    updatedStudyObject.outcome,
                    CLINICAL_CODELIST_GENERIC_LABEL
                );
            }

            ShowSuccess(
                `Code updates applied successfully (${appliedCodes.size} of ${modifiedCodes.length})`
            );
            await handleSubmit(updatedStudyObject);
        } catch (_error) {
            ShowError("Failed to apply code updates");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (modifiedStudyObject = null) => {
        if (protocolRequired && !selectedProtocol?.id) {
            ShowError("Please select a protocol first");
            return;
        }

        setIsSubmitting(true);

        const message =
            selectedProtocol?.title !== undefined
                ? `Are you sure you want to request a full database extraction using the protocol "${selectedProtocol?.title}"?`
                : `Are you sure you want to request a full database extraction`;
        const { isConfirmed } = await Confirm("Request Full DB Extraction", message);

        if (isConfirmed) {
            await projectDetails.requestFullDB(
                projectId,
                jobId,
                selectedProtocol?.id,
                modifiedStudyObject
            );
            handleClose();
        }
        setIsSubmitting(false);
    };
    const realModifiedCodesLength = modifiedCodes.filter(code => code.lastModifiedOn).length;

    const columns = useMemo(
        () => [
            {
                accessorKey: "title",
                header: "Title",
                size: 350,
                Cell: ({ cell }) => (
                    <span style={{ wordBreak: "break-word" }}>{cell.getValue()}</span>
                ),
            },
            {
                accessorKey: "fileName",
                header: "File Name",
                size: 250,
            },
            {
                accessorKey: "createdAt",
                accessorFn: originalRow => new Date(originalRow.createdAt),
                header: "Created At",
                Cell: ({ cell }) => formatDateTime(cell.getValue()),
                size: 180,
                filterVariant: "date-range",
            },
        ],
        []
    );

    const rowSelection = useMemo(() => {
        return selectedProtocol ? { [selectedProtocol.id]: true } : {};
    }, [selectedProtocol]);

    return (
        <Dialog
            maxWidth="lg"
            fullWidth={true}
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
            <DialogTitle>Request Full Database Extraction for {database?.name} </DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ mb: 3, mt: 2 }}>
                    {steps.map(label => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {activeStep === 0 && (
                    <>
                        {protocolRequired ? (
                            <Alert severity="error">
                                Please link the appropriate protocol for the study
                                <strong> {studyData?.jobName || "N/A"}</strong> to request full
                                database extraction
                            </Alert>
                        ) : (
                            <Alert severity="info">
                                You may request full database extraction for{" "}
                                <strong> {studyData?.jobName || "N/A"}</strong> without linking a
                                protocol, though this remains optional.
                            </Alert>
                        )}
                        <div style={{ marginTop: "16px" }}></div>

                        {/* Conditional rendering */}
                        {loading && protocols.length === 0 ? (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    padding: "20px",
                                }}
                            >
                                <CircularProgress />
                            </div>
                        ) : !loading && protocols.length === 0 && !debouncedSearchTerm ? (
                            <Paper style={{ padding: "16px", textAlign: "center" }}>
                                <Typography variant="body1">No protocols available</Typography>
                                <Link
                                    to="/studyprotocols?tab=1"
                                    variant="body2"
                                    style={{ color: systemTheme.palette.primary.main }}
                                >
                                    Click here to add a new protocol
                                </Link>
                            </Paper>
                        ) : (
                            <LocalizationProvider
                                dateAdapter={AdapterDateFns}
                                adapterLocale={enLocale}
                            >
                                <MaterialReactTable
                                    columns={columns}
                                    data={protocols}
                                    enableColumnFilters={protocols?.length > 0}
                                    enableSorting={protocols?.length > 0}
                                    enableColumnActions={protocols?.length > 0}
                                    showGlobalFilter={protocols?.length > 0}
                                    enableRowSelection
                                    enableMultiRowSelection={false} // Disable multi-selection (uses radio buttons)
                                    getRowId={originalRow => originalRow.id} // Crucial for selection state persistence
                                    onRowSelectionChange={handleRowSelectionChange} // MRT handler to update our state
                                    // *** Manual Pagination & Search Configuration ***
                                    manualPagination
                                    enableGlobalFilter={false}
                                    rowCount={pageInfo.totalElements || 0}
                                    enableDensityToggle={false}
                                    enableFullScreenToggle={false}
                                    muiTablePaperProps={{
                                        elevation: 0,
                                    }}
                                    // *** State Management Integration ***
                                    state={{
                                        isLoading: loading,
                                        pagination,
                                        rowSelection, // Pass controlled selection state to MRT
                                        showProgressBars: loading,
                                    }}
                                    // *** Event Handlers ***
                                    onPaginationChange={setPagination}
                                    // *** Top Toolbar for Search ***
                                    renderTopToolbarCustomActions={() => (
                                        <TextField
                                            label="Search Protocols by Title"
                                            variant="outlined"
                                            size="small"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            fullWidth
                                        />
                                    )}
                                    // *** Row Detail Panel***
                                    renderDetailPanel={({ row }) => (
                                        <Box
                                            sx={{
                                                p: 2,
                                                border: "1px solid",
                                                borderRadius: "4px",
                                                mt: 1,
                                                mb: 1,
                                                wordBreak: "break-word",
                                                overflowWrap: "break-word",
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                component="div"
                                                sx={{ mb: 0.5 }}
                                            >
                                                Title
                                            </Typography>
                                            <Typography variant="h6" sx={{ flexGrow: 1, mb: 1 }}>
                                                {row.original.title}
                                            </Typography>

                                            <Typography
                                                variant="subtitle2"
                                                component="div"
                                                sx={{ mb: 0.5 }}
                                            >
                                                Description
                                            </Typography>
                                            {row.original.description ? (
                                                <Typography variant="body1" sx={{ mb: 2 }}>
                                                    {row.original.description}
                                                </Typography>
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontStyle: "italic", mb: 2 }}
                                                >
                                                    No description provided
                                                </Typography>
                                            )}

                                            <Typography
                                                variant="subtitle2"
                                                component="div"
                                                sx={{ mb: 0.5 }}
                                            >
                                                File Information
                                            </Typography>
                                            <Typography variant="body2">
                                                File Name: {row.original.fileName}
                                            </Typography>
                                            <Typography variant="body2">
                                                File Size: {formatFileSize(row.original.fileSize)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                Content Type: {row.original.contentType}
                                            </Typography>

                                            <Typography
                                                variant="subtitle2"
                                                component="div"
                                                sx={{ mb: 0.5 }}
                                            >
                                                Created by
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                {row.original.userId}
                                            </Typography>

                                            <Typography
                                                variant="subtitle2"
                                                component="div"
                                                sx={{ mb: 0.5 }}
                                            >
                                                Timestamps
                                            </Typography>
                                            <Typography variant="body2">
                                                Created: {formatDateTime(row.original.createdAt)}
                                            </Typography>
                                            {row.original.updatedAt && (
                                                <Typography variant="body2">
                                                    Last Updated:{" "}
                                                    {formatDateTime(row.original.updatedAt)}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                    muiTablePaginationProps={{
                                        rowsPerPageOptions: [5, 10, 20, 50],
                                        showFirstButton: true,
                                        showLastButton: true,
                                        labelDisplayedRows: () => {
                                            const pageFrom =
                                                (pageInfo.page || 0) * (pageInfo.size || 10) + 1;
                                            const pageTo = Math.min(
                                                ((pageInfo.page || 0) + 1) * (pageInfo.size || 10),
                                                pageInfo.totalElements || 0
                                            );
                                            return `${pageFrom}–${pageTo} of ${pageInfo.totalElements || 0}`;
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        )}
                    </>
                )}

                {activeStep === 1 && (
                    <>
                        {modifiedCodes.length === 0 && (
                            <>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    All the code lists in the study are up to date with library.
                                </Alert>
                            </>
                        )}
                        {modifiedCodes.length > 0 && (
                            <>
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    The following code lists have been modified since they were
                                    added to this study. You can apply changes individually, apply
                                    all at once, or skip to proceed without changes.
                                </Alert>

                                <Box
                                    sx={{
                                        mb: 3,
                                        display: "flex",
                                        gap: 2,
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={handleApplyAllCodes}
                                        disabled={isSubmitting}
                                    >
                                        Apply All Changes
                                    </Button>
                                    <Typography variant="body2" sx={{ alignSelf: "center" }}>
                                        {appliedCodes.size} of {realModifiedCodesLength} selected
                                    </Typography>
                                </Box>
                            </>
                        )}
                        {modifiedCodes?.map((codeInfo, index) => (
                            <Paper
                                key={index}
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    border: appliedCodes.has(index) ? 2 : 1,
                                    borderColor: appliedCodes.has(index)
                                        ? "primary.main"
                                        : "divider",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        mb: 1,
                                    }}
                                >
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" gutterBottom>
                                            {codeInfo.filename || codeInfo.label}{" "}
                                            <Chip label={codeInfo.codeType.toUpperCase()}></Chip>
                                        </Typography>
                                        {codeInfo.lastModifiedOn ? (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                gutterBottom
                                            >
                                                modified by: {codeInfo.lastModifiedBy} on{" "}
                                                {formatDateTime(codeInfo.lastModifiedOn)}
                                            </Typography>
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                gutterBottom
                                            >
                                                Not found in library, it may have been deleted.
                                            </Typography>
                                        )}
                                    </Box>
                                    {codeInfo.lastModifiedOn && (
                                        <Button
                                            variant={
                                                appliedCodes.has(index) ? "contained" : "outlined"
                                            }
                                            color={appliedCodes.has(index) ? "success" : "primary"}
                                            onClick={() => handleApplySingleCode(index)}
                                            disabled={isSubmitting}
                                            size="small"
                                        >
                                            {appliedCodes.has(index) ? " Changes applied" : "Apply"}
                                        </Button>
                                    )}
                                </Box>

                                {Object.keys(codeInfo.addedCodes || {}).length > 0 &&
                                    codeInfo.lastModifiedOn && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography
                                                variant="subtitle2"
                                                color="success.main"
                                                gutterBottom
                                            >
                                                Added Codes (
                                                {Object.keys(codeInfo.addedCodes).length}):
                                            </Typography>
                                            <Box
                                                sx={{
                                                    maxHeight: "150px",
                                                    overflow: "auto",
                                                    pl: 2,
                                                    bgcolor: "success.light",
                                                    borderRadius: 1,
                                                    p: 1,
                                                }}
                                            >
                                                {Object.entries(codeInfo.addedCodes).map(
                                                    ([code, desc]) => (
                                                        <Typography
                                                            key={code}
                                                            variant="body2"
                                                            sx={{ fontFamily: "monospace" }}
                                                        >
                                                            + {code}: {desc}
                                                        </Typography>
                                                    )
                                                )}
                                            </Box>
                                        </Box>
                                    )}

                                {Object.keys(codeInfo.removedCodes || {}).length > 0 &&
                                    codeInfo.lastModifiedOn && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography
                                                variant="subtitle2"
                                                color="error.main"
                                                gutterBottom
                                            >
                                                Removed Codes (
                                                {Object.keys(codeInfo.removedCodes).length}
                                                ):
                                            </Typography>
                                            <Box
                                                sx={{
                                                    maxHeight: "150px",
                                                    overflow: "auto",
                                                    pl: 2,
                                                    bgcolor: "error.light",
                                                    borderRadius: 1,
                                                    p: 1,
                                                }}
                                            >
                                                {Object.entries(codeInfo.removedCodes).map(
                                                    ([code, desc]) => (
                                                        <Typography
                                                            key={code}
                                                            variant="body2"
                                                            sx={{ fontFamily: "monospace" }}
                                                        >
                                                            - {code}: {desc}
                                                        </Typography>
                                                    )
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                            </Paper>
                        ))}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                {activeStep === 1 && (
                    <Button onClick={handleBack} disabled={isSubmitting}>
                        Back
                    </Button>
                )}
                {activeStep === 0 ? (
                    <Button
                        onClick={handleNext}
                        color="primary"
                        variant="contained"
                        disabled={
                            (protocolRequired && selectedProtocol === null) ||
                            isCheckingCodes ||
                            loading
                        }
                    >
                        {isCheckingCodes ? <CircularProgress size={24} color="inherit" /> : "Next"}
                    </Button>
                ) : (
                    <Button
                        onClick={handleApplyCodeUpdates}
                        color="primary"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : appliedCodes.size === 0 ? (
                            "Submit"
                        ) : (
                            `Apply ${appliedCodes.size} Change${appliedCodes.size !== 1 ? "s" : ""} & Submit`
                        )}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
});

export default FullDatabaseRequestDialog;
