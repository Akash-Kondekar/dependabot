import React from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid2 as Grid,
    IconButton,
    Paper,
    Stack,
    Switch,
    Tooltip,
    Typography,
} from "@mui/material";
import { BasicButton, DisplayDate, Dropdown, Input, NoData, Radiogroup } from "../../Common";
import { observer } from "mobx-react";
import clientStore from "../../../state/store/admin/clients/details";
import resourceStore from "../../../state/store/admin/clients/resources";
import {
    AddCircle,
    DeleteOutline,
    EditOutlined,
    ExpandMore,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";
import {
    clientStatus,
    formatDate,
    isValidDate,
    isValidDateRange,
    prepareData,
} from "../../../utils";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import {
    CURRENT_DATE,
    DATABASE_FIELDS,
    INPUT_TYPE_PASSWORD,
    INPUT_TYPE_TEXT,
    PROTOCOL_MANDATORY,
    PROTOCOL_OPTIONAL,
    radioOptionsYesNo,
    SSH_FIELDS,
} from "../../../constants";
import PropTypes from "prop-types";
import { ShowSuccess, ShowWarning } from "../../../componentsV2/Common/Toast";
import { Confirm } from "../../../componentsV2/Common/Confirm";

const useStyles = makeStyles(() => ({
    root: {
        m: 1,
        marginTop: "20px",
        minHeight: "400px",
        maxHeight: 500,
        overflowY: "auto",
        boxShadow:
            "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
        width: "99%",
    },
    paper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
    },
}));

const DATABASE_ACTIONS = {
    ADD: "Add",
    UPDATE: "Update",
};

const DisplayDateAndAnalytics = observer(
    ({ database, handleDateChange, readOnly, toggleAnalytics, toggleProtocol }) => {
        return (
            <div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        columnGap: "10px",
                    }}
                >
                    <DisplayDate
                        selectedDate={
                            database?.clientDatabaseStartDate !== undefined
                                ? database?.clientDatabaseStartDate
                                : new Date()
                        }
                        name="Start Date"
                        handleDateChange={newValue => {
                            if (isValidDate(newValue)) {
                                handleDateChange(newValue, "clientDatabaseStartDate");
                            }
                        }}
                        ariaLabel="Start Date"
                        label="Start Date"
                        minDate={
                            database?.databaseStartDate !== undefined &&
                            new Date(database.databaseStartDate)
                        }
                        maxDate={
                            database?.databaseEndDate !== undefined &&
                            new Date(database.databaseEndDate)
                        }
                        readOnly={readOnly}
                    />

                    <DisplayDate
                        selectedDate={
                            database?.clientDatabaseEndDate !== undefined
                                ? database?.clientDatabaseEndDate
                                : new Date()
                        }
                        name="End Date"
                        handleDateChange={newValue => {
                            if (isValidDate(newValue)) {
                                handleDateChange(newValue, "clientDatabaseEndDate");
                            }
                        }}
                        ariaLabel="End Date"
                        label="End Date"
                        minDate={
                            database?.databaseStartDate !== undefined &&
                            new Date(database.databaseStartDate)
                        }
                        maxDate={
                            database?.databaseEndDate !== undefined &&
                            new Date(database.databaseEndDate)
                        }
                        readOnly={readOnly}
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "15px",
                    }}
                >
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                checked={database?.analytics}
                                onClick={() => toggleAnalytics("analytics")}
                            />
                        }
                        label="Allow Analytics"
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "15px",
                    }}
                >
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                checked={database?.protocol}
                                onClick={() => toggleProtocol("protocol")}
                            />
                        }
                        label="Requires Study Protocol?"
                    />
                </div>
            </div>
        );
    }
);

const DisplayDatabaseConfig = observer(({ databaseConfig, setDBConfig }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [ssh, setSsh] = React.useState(databaseConfig.ssh ? databaseConfig.ssh : false);

    const handleClickShowPassword = () => setShowPassword(show => !show);
    const handleSshToggle = value => {
        const isSshSelected = value === "true";
        setSsh(isSshSelected);
        setDBConfig("ssh", isSshSelected);
    };

    const renderDbConfigField = field => (
        <Input
            key={field.name}
            label={field.label}
            value={databaseConfig[field.name]}
            onChange={e => setDBConfig(field.name, e.target.value)}
            type={showPassword ? INPUT_TYPE_TEXT : INPUT_TYPE_PASSWORD}
        />
    );

    return (
        <Accordion style={{ margin: "10px 0px" }}>
            <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                style={{ margin: "5px" }}
            >
                <Typography>Database Config</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box textAlign="center">
                    <BasicButton
                        aria-label="toggle password visibility"
                        edge="end"
                        variant="outlined"
                        buttonText={showPassword ? "Hide" : "Show"}
                        handleClick={handleClickShowPassword}
                        endIcon={showPassword ? <Visibility /> : <VisibilityOff />}
                    />
                </Box>
                {DATABASE_FIELDS.map(renderDbConfigField)}

                <Typography>Need SSH?</Typography>
                <Radiogroup
                    name="needSSH"
                    value={ssh}
                    handleChange={e => handleSshToggle(e.target.value)}
                    radioOptions={radioOptionsYesNo}
                />

                {ssh === true && SSH_FIELDS.map(renderDbConfigField)}
            </AccordionDetails>
        </Accordion>
    );
});

function DisplayWarning(type, date) {
    const phrase = type === "Start Date" ? "less" : "more";
    return ShowWarning(
        `Selected ${type} cannot be ${phrase} than ${formatDate(
            date,
            "dd-MMM-yyyy"
        )} ( which is the database's ${type} )`
    );
}

function validateDatabaseDates(database) {
    const { clientDatabaseStartDate, clientDatabaseEndDate, databaseStartDate, databaseEndDate } =
        database;

    if (!isValidDateRange(clientDatabaseStartDate, clientDatabaseEndDate, true)) {
        return ShowWarning("Invalid Date range, please correct the dates and try again");
    }

    if (!isValidDateRange(databaseStartDate, clientDatabaseStartDate, true)) {
        return DisplayWarning("Start Date", databaseStartDate);
    }

    if (!isValidDateRange(clientDatabaseEndDate, databaseEndDate, true)) {
        return DisplayWarning("End Date", databaseEndDate);
    }

    return true;
}

const DisplayDialog = props => {
    const { open, setOpen, database, cancelEditAndClose, setNewClientDatabase } = props;
    const classes = useStyles();
    const [databaseConfig, setDatabaseConfig] = React.useState(database.databaseConfig);
    if (databaseConfig.id === undefined) {
        setDatabaseConfig({ ...databaseConfig, id: database.databaseId });
    }
    if (databaseConfig.databaseName === undefined) {
        setDatabaseConfig({ ...databaseConfig, databaseName: database.databaseName });
    }
    const setDBConfig = (type, value) => {
        if (type === "databasePort") {
            const databasePort = parseInt(value, 10);
            value = isNaN(databasePort) || databasePort <= 0 ? null : databasePort;
        }
        setDatabaseConfig({ ...databaseConfig, [type]: value });
    };

    const { clientDatabaseStartDate, clientDatabaseEndDate, analytics, protocol } = database;

    const handleDatabaseChange = async () => {
        const payload = {
            startdt: clientDatabaseStartDate,
            enddt: clientDatabaseEndDate,
            analytics: analytics,
            protocol: protocol,
            databaseConfig: databaseConfig,
        };

        const isValid = validateDatabaseDates(database);

        const message = "Database updated successfully";

        const success =
            isValid &&
            (await resourceStore.update(payload, clientStore?.clientId, database.databaseId));

        if (success) {
            ShowSuccess(message);
        }
        setNewClientDatabase({});
        setOpen(false);
    };

    return (
        <Dialog onClose={() => setOpen(false)} aria-labelledby="Update" open={open} maxWidth="md">
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Update
                <IconButton
                    aria-label="close"
                    onClick={cancelEditAndClose}
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
                        <DisplayDateAndAnalytics {...props} />
                    </Typography>
                    <DisplayDatabaseConfig
                        databaseConfig={databaseConfig}
                        setDBConfig={setDBConfig}
                    />
                </DialogContent>
            </div>
            <DialogActions>
                <Stack direction="row" spacing={2} width="100%" justifyContent="center">
                    <BasicButton
                        variant="outlined"
                        color="primary"
                        handleClick={() => {
                            cancelEditAndClose(database?.databaseId);
                        }}
                        buttonText="Cancel"
                    />

                    <BasicButton
                        variant="contained"
                        color="primary"
                        handleClick={e => handleDatabaseChange(e)}
                        buttonText="Update"
                    />
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export const Resources = observer(() => {
    const [open, setOpen] = React.useState(false);
    const [newClientDatabase, setNewClientDatabase] = React.useState({});
    const [openAddDbModal, setOpenAddDbModal] = React.useState(false);
    const classes = useStyles();

    const status = clientStatus(clientStore.client);
    const readonly = clientStore.readOnlyClient(status);

    React.useEffect(() => {
        (async () => {
            await resourceStore.load();
            await resourceStore.get(clientStore?.clientId);
        })();
    }, []);

    const closeAddDbModal = () => {
        setNewClientDatabase({});
        setOpenAddDbModal(false);
    };

    const saveDatabase = async () => {
        const { clientDatabaseStartDate, clientDatabaseEndDate, databaseId, analytics, protocol } =
            newClientDatabase;

        const payload = {
            databaseId: databaseId,
            startdt: clientDatabaseStartDate,
            enddt: clientDatabaseEndDate,
            analytics: analytics,
            protocol: protocol,
        };

        const isValid = validateDatabaseDates(newClientDatabase);

        const message = "Database added successfully";

        const success = isValid && (await resourceStore.add(payload, clientStore?.clientId));

        if (success) {
            ShowSuccess(message);
        }

        //Once db has been saved successfully, clear local state and hide modal window.
        closeAddDbModal();
    };

    const handleChange = value => {
        const result = resourceStore.activeDatabases.find(db => db.name === value);

        const database = {
            ...result,
            databaseName: value,
            clientDatabaseStartDate: result?.databaseStartDate,
            clientDatabaseEndDate: result?.databaseEndDate,
        };

        setNewClientDatabase(database);
    };

    const removeDatabase = async database => {
        const { isConfirmed } = await Confirm(
            "Delete Database",
            "Are you sure you want to delete this Database"
        );
        if (isConfirmed) {
            const success = await resourceStore.delete(clientStore?.clientId, database.databaseId);
            if (success) {
                ShowSuccess("Database Deleted");
            }
        }
    };

    const handleDateChange = (date, type) => {
        setNewClientDatabase({ ...newClientDatabase, [type]: formatDate(date, "yyyy-MM-dd") });
    };

    const isDatabasePresent = currrentDb => {
        return resourceStore?.clientDatabases?.slice().some(db => db.databaseName === currrentDb);
    };

    const cancelEditAndClose = databaseId => {
        const target = findIndexByDatabaseId(resourceStore.clientDatabases, databaseId);
        const sourceDatabaseIndex = findIndexByDatabaseId(
            resourceStore?.clientDatabases,
            databaseId
        );
        const sourceDatabase = resourceStore?.clientDatabases[sourceDatabaseIndex];

        const databases = [...resourceStore.clientDatabases];
        databases[target] = {
            ...databases[target],
            clientDatabaseStartDate: sourceDatabase?.clientDatabaseStartDate,
            clientDatabaseEndDate: sourceDatabase?.clientDatabaseEndDate,
        };
        resourceStore.setClientDatabase(databases);

        setNewClientDatabase({}); //Clear the unsaved changes from local state on cancel
        setOpen(false);
    };

    /**
     * A common function to toggle a boolean property in the newClientDatabase state.
     * @param {string} propertyName - The name of the property to toggle (e.g., 'analytics', 'protocol').
     */
    const toggleClientDatabaseProperty = propertyName => {
        setNewClientDatabase(prevClientDatabase => ({
            ...prevClientDatabase,
            [propertyName]: !prevClientDatabase[propertyName], // Dynamically access and toggle the property
        }));
    };

    const noActiveDatabases =
        resourceStore?.activeDatabases && resourceStore?.activeDatabases?.length === 0;

    if (resourceStore.loading) {
        return "Loading...";
    }

    if (noActiveDatabases) {
        return (
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <NoData message="No Databases available" />
            </div>
        );
    }

    const DisplayNoData = () => {
        return (
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <NoData message="Click on Plus icon to map a database to this client" />
            </div>
        );
    };

    const getEligibleActiveDatabases = dropdownId => {
        const mappedDatabaseIds = resourceStore?.clientDatabases?.map(
            ({ databaseId }) => databaseId
        );
        //Ignore current database Id from the dropdown list and filter all other mapped Ids
        const filterEligibleDatabaseIds = mappedDatabaseIds.filter(id => id !== dropdownId);
        const eligibleActiveDatabases = resourceStore?.activeDatabases?.filter(
            ({ id }) => !filterEligibleDatabaseIds.includes(id)
        );

        return eligibleActiveDatabases;
    };

    const isDatabaseActive = (database, action = "") => {
        //if adding database, validation is not needed. Since the component ClientDatabase expects a return value
        // we are returning true here.

        if (action === DATABASE_ACTIONS.ADD) {
            return true;
        }
        const dateNow = formatDate(CURRENT_DATE, "yyyy-MM-dd");
        return (
            database?.databaseDeleted === false &&
            database?.databaseStartDate <= dateNow &&
            database?.databaseEndDate >= dateNow
        );
    };

    const findIndexByDatabaseId = (data, databaseId) => {
        return data.findIndex(db => db.databaseId === databaseId);
    };

    const DisplayEligibleActions = ({ databaseAlreadyAdded, isDatabaseActive, db }) => {
        if (databaseAlreadyAdded && isDatabaseActive) {
            return (
                <span>
                    <Tooltip title="Update" aria-label="Update">
                        <span>
                            <IconButton
                                onClick={() => {
                                    setNewClientDatabase(db);
                                    setOpen(true);
                                }}
                                disabled={readonly}
                            >
                                <EditOutlined />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Delete Database" aria-label="Delete Database">
                        <span>
                            <IconButton onClick={() => removeDatabase(db)} disabled={readonly}>
                                <DeleteOutline />
                            </IconButton>
                        </span>
                    </Tooltip>
                </span>
            );
        }

        if (!isDatabaseActive) {
            return (
                <Tooltip title="Delete Database" aria-label="Delete Database">
                    <span>
                        <IconButton onClick={() => removeDatabase(db)} disabled={readonly}>
                            <DeleteOutline />
                        </IconButton>
                    </span>
                </Tooltip>
            );
        }
    };

    const DisplayDatabaseName = ({ db }) => {
        return (
            <Dropdown
                ddLabel="Select Database"
                labelName="Database"
                labelValue="Select Database"
                value={db?.databaseName || ""}
                handleChange={e => handleChange(e.target.value, db?.databaseId)}
                dropdownOptions={prepareData(getEligibleActiveDatabases(db?.databaseId), {
                    value: "name",
                    label: "name",
                })}
                disabled={readonly}
            />
        );
    };

    const DisplayDates = ({ isDatabaseActive, db, databaseAlreadyAdded }) => {
        const analyticsStatus = db?.analytics ? "Enabled" : "Disabled";
        const studyProtocolStatus = db.protocol ? PROTOCOL_MANDATORY : PROTOCOL_OPTIONAL;
        if (databaseAlreadyAdded && isDatabaseActive) {
            return (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ flexBasis: "35%" }}>{db?.clientDatabaseStartDate}</div>
                    <div style={{ flexBasis: "35%" }}>{db?.clientDatabaseEndDate}</div>
                    <div style={{ flexBasis: "30%" }}>{analyticsStatus}</div>
                    <div style={{ flexBasis: "30%" }}>{studyProtocolStatus}</div>
                </div>
            );
        }

        if (isDatabaseActive) {
            return (
                <DisplayDateAndAnalytics
                    handleDateChange={handleDateChange}
                    database={db}
                    readOnly={databaseAlreadyAdded || readonly}
                    disabled={readonly}
                    toggleAnalytics={toggleClientDatabaseProperty}
                    toggleProtocol={toggleClientDatabaseProperty}
                />
            );
        }
        return (
            <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ flexBasis: "35%" }}>{db?.clientDatabaseStartDate}</div>
                <div style={{ flexBasis: "35%" }}>{db?.clientDatabaseEndDate}</div>
                <div style={{ flexBasis: "30%" }}>{analyticsStatus}</div>
                <div style={{ flexBasis: "30%" }}>{studyProtocolStatus}</div>
            </div>
        );
    };

    const ClientDatabase = ({ isDatabaseActive, db, action }) => {
        const gridWidthForDateField = action === DATABASE_ACTIONS.ADD ? 9 : 7;
        return (
            <Grid container spacing={2} sx={{ alignItems: "center", justifyContent: "center" }}>
                {isDatabasePresent(db?.databaseName) || !isDatabaseActive ? (
                    <Grid size={{ xs: 3, md: 3, lg: 3 }}>
                        <span>{db?.databaseName}</span>
                    </Grid>
                ) : (
                    <>
                        <Grid size={9}>
                            <DisplayDatabaseName db={db} />
                        </Grid>
                    </>
                )}

                <Grid
                    size={{
                        xs: gridWidthForDateField,
                        md: gridWidthForDateField,
                        lg: gridWidthForDateField,
                    }}
                >
                    <DisplayDates
                        db={db}
                        databaseAlreadyAdded={isDatabasePresent(db?.databaseName)}
                        isDatabaseActive={isDatabaseActive}
                    />
                </Grid>
                {action !== DATABASE_ACTIONS.ADD && (
                    <Grid
                        size={{
                            xs: 2,
                            md: 2,
                            lg: 2,
                        }}
                    >
                        <DisplayEligibleActions
                            databaseAlreadyAdded={isDatabasePresent(db?.databaseName)}
                            isDatabaseActive={isDatabaseActive}
                            db={db}
                        />
                    </Grid>
                )}
            </Grid>
        );
    };

    const hasData = resourceStore.clientDatabases.length > 0 && !noActiveDatabases;

    // We are using -1 (Since our database Ids starts from 1) here. So it will not match any existing databaseIds while fetching eligible databases.
    const GET_ALL_ELIGIBLE_DATABASES = -1;

    const canAddDatabases =
        !noActiveDatabases && getEligibleActiveDatabases(GET_ALL_ELIGIBLE_DATABASES).length > 0;

    const noDatabaseSelected =
        newClientDatabase?.databaseName === undefined || newClientDatabase?.databaseName === "";

    return (
        <div style={{ width: "90%", marginLeft: "4rem" }}>
            <Paper sx={{ width: "100%" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography
                        variant="h6"
                        p={2}
                        sx={{ width: "100%", textTransform: "capitalize" }}
                    >
                        Database
                    </Typography>
                    <div>
                        <Tooltip title="Add Database" aria-label="Add Database">
                            <span>
                                <IconButton
                                    onClick={() => {
                                        setOpenAddDbModal(true);
                                    }}
                                    disabled={readonly || !canAddDatabases}
                                >
                                    <AddCircle />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </div>
                </Stack>
            </Paper>
            <Container maxWidth="100%" className={classes.root}>
                {hasData && (
                    <div>
                        <Grid
                            container
                            spacing={2}
                            sx={{
                                alignItems: "center",
                                pb: "20px",
                                fontWeight: "bold",
                            }}
                        >
                            <Grid sx={{ mt: "8px" }} size={{ xs: 3, md: 3, lg: 3 }}>
                                Name
                            </Grid>

                            <Grid size={{ xs: 7, md: 7, lg: 7 }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <div style={{ flexBasis: "35%" }}>Start Date</div>
                                    <div style={{ flexBasis: "35%" }}>End Date</div>
                                    <div style={{ flexBasis: "30%" }}>Analytics</div>
                                    <div style={{ flexBasis: "30%" }}>Protocol Required</div>
                                </div>
                            </Grid>

                            <Grid size={{ xs: 2, md: 2, lg: 2 }}>Action(s)</Grid>
                        </Grid>
                        {resourceStore.clientDatabases?.map(db => (
                            <div key={db?.databaseId}>
                                <ClientDatabase db={db} isDatabaseActive={isDatabaseActive(db)} />
                                <Divider variant="middle" />
                            </div>
                        ))}
                    </div>
                )}

                {openAddDbModal && (
                    <Dialog
                        onClose={() => closeAddDbModal()}
                        aria-labelledby="Add-Database"
                        open={openAddDbModal}
                        fullWidth
                        maxWidth="md"
                    >
                        <DialogTitle sx={{ m: 0, p: 2 }}>
                            Add Database
                            <IconButton
                                aria-label="close"
                                onClick={() => closeAddDbModal()}
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
                        <div>
                            <DialogContent dividers>
                                <Typography gutterBottom component="div">
                                    <ClientDatabase
                                        isDatabaseActive={isDatabaseActive(
                                            newClientDatabase,
                                            DATABASE_ACTIONS.ADD
                                        )}
                                        db={newClientDatabase}
                                        action={DATABASE_ACTIONS.ADD}
                                    />
                                </Typography>
                            </DialogContent>
                        </div>
                        <DialogActions>
                            <Stack
                                direction="row"
                                spacing={2}
                                width="100%"
                                justifyContent="flex-end"
                            >
                                <BasicButton
                                    variant="outlined"
                                    color="primary"
                                    handleClick={() => closeAddDbModal()}
                                    buttonText="Cancel"
                                />
                                <BasicButton
                                    variant="contained"
                                    color="primary"
                                    handleClick={() => saveDatabase()}
                                    buttonText="Save"
                                    disabled={noDatabaseSelected}
                                />
                            </Stack>
                        </DialogActions>
                    </Dialog>
                )}

                {open && (
                    <DisplayDialog
                        handleDateChange={handleDateChange}
                        open={open}
                        setOpen={setOpen}
                        database={newClientDatabase}
                        cancelEditAndClose={cancelEditAndClose}
                        setNewClientDatabase={setNewClientDatabase}
                        toggleAnalytics={toggleClientDatabaseProperty}
                        toggleProtocol={toggleClientDatabaseProperty}
                    />
                )}

                {!hasData && <DisplayNoData />}
            </Container>
        </div>
    );
});

Resources.propTypes = {
    open: PropTypes.bool,
    setOpen: PropTypes.func,
    database: PropTypes.object,
    cancelEditAndClose: PropTypes.func,
    setNewClientDatabase: PropTypes.func,
    isDatabaseActive: PropTypes.bool,
    db: PropTypes.object,
    action: PropTypes.string,
};
