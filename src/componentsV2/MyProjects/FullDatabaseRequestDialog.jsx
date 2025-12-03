import React, { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import { Alert, Typography } from "@mui/material";
import { DialogBox } from "../Common/DialogBox.jsx";
import studyProtocolStore from "../../state/store/studyProtocol";
import { MaterialReactTable } from "material-react-table";
import Box from "@mui/material/Box";
import { formatDateTime, getUserFriendlyTime } from "../../utils/index.jsx";
import projectDetails from "../../state/store/projects/details";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useTheme } from "@mui/material/styles";
import enLocale from "date-fns/locale/en-GB";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import { DisplayAvatar } from "../Common/Avatar.jsx";
import { baseMRTOptions } from "../../constants/index.jsx";
import { Input } from "../Common/Input.jsx";
import AddNewProtocol from "../StudyProtocol/AddNewProtocol.jsx";
import { BasicButton } from "../Common/BasicButton.jsx";
import { ShowError } from "../Common/Toast.jsx";
import { Confirm } from "../Common/Confirm.jsx";

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
    const [selectedProtocol, setSelectedProtocol] = useState(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [pagination, setPagination] = useState({
        pageIndex: studyProtocolStore.page.page || 0,
        pageSize: studyProtocolStore.page.size || 10,
    });
    const database = projectDetails.listOfUserDatabases.find(
        database => database.name === studyData.databaseName
    );
    const protocols = studyProtocolStore.list || [];
    const loading = studyProtocolStore.loading;
    const pageInfo = studyProtocolStore.page;
    const systemTheme = useTheme();
    const isDarkMode = systemTheme.palette.mode === "dark";
    const baseBackgroundColor = isDarkMode
        ? systemTheme.palette.grey.main
        : systemTheme.palette.grey.light;
    const protocolRequired = database?.protocol === true;

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
    const loadDataForDialog = () => {
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
        }
    };
    useEffect(() => {
        loadDataForDialog();
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

    const handleSubmit = async () => {
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
            await projectDetails.requestFullDB(projectId, jobId, selectedProtocol?.id);
            handleClose();
        }
        setIsSubmitting(false);
    };

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
                header: "Added on",
                Cell: ({ cell }) => {
                    return (
                        <Tooltip title={formatDateTime(cell.getValue())}>
                            <Typography variant={"body2"}>
                                {getUserFriendlyTime(cell.getValue())}
                            </Typography>
                        </Tooltip>
                    );
                },
                size: 180,
                filterVariant: "date-range",
            },
        ],
        []
    );

    const rowSelection = useMemo(() => {
        return selectedProtocol ? { [selectedProtocol.id]: true } : {};
    }, [selectedProtocol]);

    if (!loading && protocols.length === 0 && !debouncedSearchTerm && protocolRequired) {
        return (
            <AddNewProtocol
                onClose={handleClose}
                title="Please upload the relevent study protocol to proceed"
            />
        );
    }

    const TypographyLabel = ({ label }) => {
        return (
            <Typography
                variant="body1"
                fontWeight={600}
                color={systemTheme.palette.grey.contrastText}
                mt={2}
                mb={2}
                sx={{
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                }}
            >
                {label}
            </Typography>
        );
    };

    const TypographyValue = ({ label }) => {
        return (
            <Typography
                variant="body2"
                fontWeight={500}
                color={systemTheme.palette.grey.contrastText}
                sx={{
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                }}
            >
                {label}
            </Typography>
        );
    };

    return (
        <DialogBox
            maxWidth="lg"
            fullWidth={true}
            open={open}
            handleClose={handleClose}
            closeAfterTransition
            title={`Request Full Database Extraction for ${database?.name} `}
            Content={
                <>
                    <div style={{ marginTop: "16px" }}></div>
                    {protocolRequired ? (
                        <Alert severity="error">
                            Please link the appropriate protocol for the study
                            <strong> {studyData?.jobName || "N/A"}</strong> to request full database
                            extraction
                        </Alert>
                    ) : (
                        <Alert severity="info">
                            You may request full database extraction for{" "}
                            <strong> {studyData?.jobName || " the study "}</strong> without linking
                            a protocol, though this remains optional.
                        </Alert>
                    )}
                    <div style={{ marginTop: "16px" }}></div>

                    {/* Conditional rendering */}
                    {loading && protocols.length === 0 ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                            <CircularProgress />
                        </div>
                    ) : !loading && protocols.length === 0 && !debouncedSearchTerm ? (
                        <Typography variant="body1" color="text.secondary" align="center">
                            To add a protocol to your account, please visit the study protocols
                            page.
                        </Typography>
                    ) : (
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enLocale}>
                            <MaterialReactTable
                                {...baseMRTOptions}
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
                                    sx: {
                                        borderRadius: "32px",
                                        border: "0",
                                    },
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
                                    <Input
                                        slotProps={{
                                            input: {
                                                sx: { borderRadius: 4 },
                                            },
                                        }}
                                        label="Search Protocols by Title"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        fullWidth
                                    />
                                )}
                                // *** Row Detail Panel***
                                renderDetailPanel={({ row }) => (
                                    <>
                                        <Box
                                            sx={{
                                                borderRadius: 2,
                                                pt: 1,
                                                mb: 3,
                                                position: "relative",
                                            }}
                                        >
                                            <Stack spacing={2}>
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 2,
                                                        backgroundColor: isDarkMode
                                                            ? "grey.main"
                                                            : "grey.light",
                                                        borderWidth: "1px",
                                                        borderStyle: "solid",
                                                        borderColor: isDarkMode
                                                            ? "grey.light"
                                                            : "grey.main",
                                                    }}
                                                >
                                                    <>
                                                        <TypographyLabel
                                                            label={row.original.title}
                                                        />

                                                        <Typography
                                                            variant="body1"
                                                            fontWeight={400}
                                                            color={
                                                                systemTheme.palette.grey
                                                                    .contrastText
                                                            }
                                                            mt={1}
                                                            sx={{
                                                                lineHeight: "1",
                                                                letterSpacing: "-0.16px",
                                                                wordBreak: "break-word",
                                                                whiteSpace: "pre-wrap",
                                                                fontStyle: row.original.description
                                                                    ? "normal"
                                                                    : "italic",
                                                            }}
                                                        >
                                                            {row.original.description
                                                                ? row.original.description
                                                                : "No description provided"}
                                                        </Typography>
                                                    </>
                                                </Box>
                                            </Stack>
                                        </Box>

                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                backgroundColor: isDarkMode
                                                    ? "grey.main"
                                                    : "grey.light",
                                                borderWidth: "1px",
                                                borderStyle: "solid",
                                                borderColor: isDarkMode
                                                    ? "grey.light"
                                                    : "grey.main",
                                            }}
                                        >
                                            <TypographyLabel label="File Information" />

                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <TypographyLabel label="File name:" />
                                                <TypographyValue label={row.original.fileName} />
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <TypographyLabel label="File size:" />
                                                <TypographyValue label={row.original.fileSize} />
                                            </Stack>

                                            <TypographyLabel label="Added by" />
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <DisplayAvatar
                                                    value={row.original.userId?.toUpperCase()}
                                                    randomColor={true}
                                                    size="small"
                                                />
                                                <TypographyValue label={row.original.userId} />
                                            </Stack>

                                            <TypographyLabel label="Timestamps" />
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <TypographyLabel label="Added on:" />
                                                <TypographyValue
                                                    label={`${getUserFriendlyTime(row.original.createdAt)} (${row.original.createdAt})`}
                                                />
                                            </Stack>
                                            {row.original.updatedAt && (
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                >
                                                    <TypographyLabel label="Last updated:" />
                                                    <TypographyValue
                                                        label={`${getUserFriendlyTime(row.original.updatedAt)} (${row.original.updatedAt})`}
                                                    />
                                                </Stack>
                                            )}
                                        </Box>
                                    </>
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
                                muiTableBodyRowProps={{
                                    sx: {
                                        "& td": {
                                            borderBottom: "none",
                                        },
                                    },
                                }}
                                mrtTheme={() => ({
                                    baseBackgroundColor: baseBackgroundColor,
                                })}
                            />
                        </LocalizationProvider>
                    )}

                    <DialogActions>
                        <BasicButton
                            handleClick={handleSubmit}
                            disabled={
                                (protocolRequired && selectedProtocol === undefined) ||
                                isSubmitting ||
                                loading
                            }
                            buttonText={
                                isSubmitting ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    "Request Extraction"
                                )
                            }
                        />
                    </DialogActions>
                </>
            }
        />
    );
});

export default FullDatabaseRequestDialog;
