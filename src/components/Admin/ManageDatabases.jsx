import React, { useMemo } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { DisplayDate, Input } from "../Common";
import {
    Avatar,
    Button,
    Container,
    CssBaseline,
    FormControlLabel,
    Grid2 as Grid,
    IconButton,
    Stack,
    Switch,
    Tooltip,
    Typography,
} from "@mui/material";
import { baseMRTOptions } from "../../constants";
import { observer } from "mobx-react";
import databaseStore from "../../state/store/admin/databases";
import {
    AddCircle,
    DeleteOutline,
    EditOutlined,
    RestoreOutlined,
    StorageRounded,
} from "@mui/icons-material";
import { formatDate, formatDateFieldAndAddSlNo, isDeepEqual, isValidDateRange } from "../../utils";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";
import RichTextDocumentationEditor from "../CodeBuilder/Common/RichTextDocumentationEditor";
import { MaterialReactTable } from "material-react-table";
import Box from "@mui/material/Box";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import enLocale from "date-fns/locale/en-GB";
import { Confirm } from "../../componentsV2/Common/Confirm";
import { ShowSuccess, ShowWarning } from "../../componentsV2/Common/Toast";

const useStyles = makeStyles(theme => ({
    paper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

export const ManageDatabases = observer(() => {
    const [action, setAction] = React.useState(false);

    React.useEffect(() => {
        databaseStore.load();
    }, []);

    const getStatus = type => {
        return type ? "Enabled" : "Disabled";
    };

    const prepareDatabaseList = list => {
        const data = list?.map(entry => {
            return {
                ...entry,
                status: entry.deleted ? "Deleted" : "Active",
                extractionStatus: getStatus(entry.extraction),
                submissionStatus: getStatus(entry.submission),
            };
        });
        return data;
    };

    if (databaseStore.busy) {
        return "Loading...";
    }

    const formattedDatabaseList = prepareDatabaseList(databaseStore.list);

    return (
        <div>
            <AddDatabase action={action} setAction={setAction} databases={formattedDatabaseList} />
            <DisplayExistingDatabases databases={formattedDatabaseList} setAction={setAction} />
        </div>
    );
});

export const DisplayExistingDatabases = observer(({ databases, setAction }) => {
    // Removed type annotations

    const processedData = useMemo(
        () => formatDateFieldAndAddSlNo(databases, ["startdt", "enddt"]),
        [databases]
    );

    const columns = useMemo(
        // Removed generic
        () => [
            {
                header: "Sl No",
                accessorKey: "slNo",
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                maxSize: 30,
            },
            { header: "Name", accessorKey: "name" },
            {
                header: "Description",
                accessorKey: "description",
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
            },
            {
                header: "Start Date",
                accessorKey: "startdt",
                dateSetting: { locale: "en-GB" },
                accessorFn: originalRow => new Date(originalRow.startdt),
                Cell: ({ cell }) => formatDate(cell.getValue()),
                filterVariant: "date-range",
            },
            {
                header: "End Date",
                accessorKey: "enddt",
                accessorFn: originalRow => new Date(originalRow.enddt),
                Cell: ({ cell }) => formatDate(cell.getValue()),
                filterVariant: "date-range",
            },
            { header: "Version", accessorKey: "version", filterFn: "contains" },
            { header: "Status", accessorKey: "status", filterVariant: "select" },
            { header: "Submission", accessorKey: "submissionStatus", filterVariant: "select" },
            { header: "Extraction", accessorKey: "extractionStatus", filterVariant: "select" },
            {
                header: "Actions",
                accessorKey: "actions", // Can be any unique key not in data
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                size: 150, // Adjust size for buttons
                muiTableBodyCellProps: {
                    // Align actions to the start
                    align: "left", // Similar to setCellProps paddingLeft
                },
                Cell: ({ row }) => {
                    // Access row data via row.original
                    const rowData = row.original;
                    return (
                        <Box sx={{ display: "flex", gap: "0.2rem" }}>
                            <Tooltip
                                title={
                                    rowData?.deleted
                                        ? "Editing is not allowed for deleted entries"
                                        : "Edit database"
                                }
                                aria-label="Edit database"
                            >
                                <span>
                                    {" "}
                                    {/* Span needed for tooltip when button is disabled */}
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setAction("Update");
                                            // Prepare data for store update
                                            const database = {
                                                ...rowData,
                                                startDate: rowData.startdt, // Map back if needed
                                                endDate: rowData.enddt, // Map back if needed
                                            };
                                            // Clean up properties not needed by store
                                            delete database.startdt;
                                            delete database.enddt;
                                            delete database.slNo;
                                            delete database.actions; // Remove the dummy key
                                            databaseStore.set(database);
                                        }}
                                        disabled={rowData?.deleted}
                                    >
                                        <EditOutlined fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            {rowData?.deleted ? (
                                <Tooltip title="Restore database" aria-label="Restore database">
                                    <IconButton
                                        onClick={async () => {
                                            const { isConfirmed } = await Confirm(
                                                "Restore Database",
                                                `Are you sure you want to restore ${rowData?.name} Database`
                                            );
                                            if (isConfirmed) {
                                                await databaseStore.restore(rowData.id);
                                                ShowSuccess("Database Restored");
                                            }
                                        }}
                                    >
                                        <RestoreOutlined fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Tooltip title="Delete database" aria-label="Delete database">
                                    <IconButton
                                        onClick={async () => {
                                            const { isConfirmed } = await Confirm(
                                                "Delete Database",
                                                `Are you sure you want to delete ${rowData?.name} Database`
                                            );
                                            if (isConfirmed) {
                                                const success = await databaseStore.remove(
                                                    rowData.id
                                                );
                                                success && ShowSuccess("Database Deleted");
                                            }
                                        }}
                                    >
                                        <DeleteOutline fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    );
                },
            },
        ],
        [setAction] // Include dependencies like setAction
    );

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enLocale}>
            <MaterialReactTable
                columns={columns}
                data={processedData}
                enableColumnFilters={processedData?.length > 0}
                enableSorting={processedData?.length > 0}
                enableColumnActions={processedData?.length > 0}
                showGlobalFilter={processedData?.length > 0}
                {...baseMRTOptions} // Base options
                renderTopToolbarCustomActions={() => (
                    <Box sx={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <Tooltip title="Add database" aria-label="Add database">
                            <Button
                                sx={{ borderRadius: 10 }}
                                variant="contained"
                                startIcon={<AddCircle />}
                                onClick={() => {
                                    setAction("Add");
                                    databaseStore.reset();
                                }}
                            >
                                Add
                            </Button>
                        </Tooltip>
                    </Box>
                )}
            />
        </LocalizationProvider>
    );
});

export const AddDatabase = observer(({ action, setAction, databases }) => {
    const isDatabaseUpdated = updatedDatabase => {
        const target = databases?.find(cl => cl.id === databaseStore.database.id);

        const currDatabase = { ...target };
        delete currDatabase.startDate;
        delete currDatabase.endDate;
        delete currDatabase.id;

        return !isDeepEqual(updatedDatabase, currDatabase);
    };

    const [editDocument, setEditDocument] = React.useState(false);

    const classes = useStyles();

    const validateDatabase = () => {
        let isValid = true;

        if (databaseStore?.database?.name === "") {
            isValid = false;
            ShowWarning("Database name cannot be empty");
        } else if (
            !isValidDateRange(databaseStore.database.startDate, databaseStore.database.endDate)
        ) {
            isValid = false;
            ShowWarning("Invalid date range, please correct the dates and try again");
        } else if (databaseStore?.database?.version === "") {
            isValid = false;
            ShowWarning("Database version cannot be empty");
        }
        return isValid;
    };

    const handleDataBaseChange = async e => {
        e.preventDefault();

        const isDbValid = validateDatabase();

        const payload = {
            ...databaseStore.database,
            startdt: formatDate(databaseStore.database.startDate, "yyyy-MM-dd"),
            enddt: formatDate(databaseStore.database.endDate, "yyyy-MM-dd"),
        };
        delete payload.id;
        delete payload.endDate;
        delete payload.startDate;

        const message =
            action === "Add" ? "Database added successfully" : "Database updated successfully";

        if (isDbValid) {
            const success =
                action === "Add"
                    ? await databaseStore.add(payload)
                    : isDatabaseUpdated(payload) && (await databaseStore.update(payload));

            if (success) {
                ShowSuccess(message);
            }
            setAction("");
        }
    };

    const documentationUpdate = html => {
        if (html) {
            databaseStore.set({
                ...databaseStore.database,
                document: { richText: html },
            });
        }
    };

    const handleClose = () => {
        setEditDocument(false);
        databaseStore.reset();
        setAction("");
    };

    const showRichTextEditor = databaseStore?.database?.document || editDocument;

    return (
        <Container component="main" maxWidth="lg" sx={{ paddingBottom: "3rem" }}>
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <StorageRounded />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Manage Database
                </Typography>
            </div>
            <Dialog
                fullWidth={true}
                maxWidth={"lg"}
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={action === "Add" || action === "Update"}
            >
                <DialogTitle sx={{ m: 0, p: 2 }}>
                    {`${action} Database`}
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: theme => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <div className={classes.paper}>
                    <DialogContent dividers>
                        <Typography gutterBottom component="div">
                            <Input
                                name="Database Name"
                                label="Database Name"
                                value={databaseStore.database.name}
                                onChange={e => {
                                    databaseStore.set({
                                        ...databaseStore.database,
                                        name: e.target.value,
                                    });
                                }}
                            />

                            <Input
                                name="Description"
                                label="Description"
                                value={databaseStore.database.description}
                                onChange={e => {
                                    databaseStore.set({
                                        ...databaseStore.database,
                                        description: e.target.value,
                                    });
                                }}
                            />

                            <DisplayDate
                                selectedDate={new Date(databaseStore.database.startDate)}
                                name="Start Date"
                                handleDateChange={newValue => {
                                    databaseStore.set({
                                        ...databaseStore.database,
                                        startDate: newValue,
                                    });
                                }}
                                ariaLabel="Start Date"
                                label="Start Date"
                            />

                            <DisplayDate
                                selectedDate={new Date(databaseStore.database.endDate)}
                                name="End Date"
                                handleDateChange={newValue => {
                                    databaseStore.set({
                                        ...databaseStore.database,
                                        endDate: newValue,
                                    });
                                }}
                                ariaLabel="End Date"
                                label="End Date"
                                minDate={new Date(databaseStore.database.startDate)}
                            />

                            <Input
                                name="Version"
                                label="Version"
                                value={databaseStore.database.version}
                                onChange={e => {
                                    databaseStore.set({
                                        ...databaseStore.database,
                                        version: e.target.value,
                                    });
                                }}
                            />
                            <Stack
                                direction="row"
                                spacing={2}
                                justifyContent="center"
                                sx={{ margin: "20px 0 20px 0" }}
                            >
                                <Tooltip title="Allow Submission" aria-label="Allow Submission">
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={databaseStore.database.submission}
                                                onClick={() => {
                                                    const database = {
                                                        ...databaseStore.database,
                                                        submission:
                                                            !databaseStore.database.submission,
                                                    };
                                                    databaseStore.set(database);
                                                }}
                                            />
                                        }
                                        label="Allow Submission"
                                    />
                                </Tooltip>

                                <Tooltip title="Allow Extraction" aria-label="Allow Extraction">
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={databaseStore.database.extraction}
                                                onClick={() => {
                                                    const database = {
                                                        ...databaseStore.database,
                                                        extraction:
                                                            !databaseStore.database.extraction,
                                                    };
                                                    databaseStore.set(database);
                                                }}
                                            />
                                        }
                                        label="Allow Extraction"
                                    />
                                </Tooltip>
                            </Stack>
                            <div style={{ margin: "20px 0 20px 0" }}>
                                {!showRichTextEditor && (
                                    <Button
                                        variant="contained"
                                        onClick={() => setEditDocument(true)}
                                    >
                                        <b>Add Documentation</b>
                                    </Button>
                                )}
                                {showRichTextEditor && (
                                    <Grid container rowSpacing={2}>
                                        <Grid size={12}>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => {
                                                    setEditDocument(false);
                                                    databaseStore.set({
                                                        ...databaseStore.database,
                                                        document: null,
                                                    });
                                                }}
                                                sx={{ float: "right", display: "block" }}
                                            >
                                                Remove Documentation
                                            </Button>
                                        </Grid>
                                        <Grid size={12}>
                                            <RichTextDocumentationEditor
                                                richTextContent={
                                                    databaseStore?.database?.document?.richText
                                                }
                                                updateContent={documentationUpdate}
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                            </div>
                        </Typography>
                    </DialogContent>
                </div>
                <DialogActions>
                    <Grid
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={2}
                    >
                        <Grid size={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="primary"
                                className={classes.submit}
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                        </Grid>
                        <Grid size={6}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={e => handleDataBaseChange(e)}
                            >
                                {action}
                            </Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
        </Container>
    );
});
