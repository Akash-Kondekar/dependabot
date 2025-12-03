import React, { useMemo } from "react";
import { observer } from "mobx-react";
import { adminServiceUsersTableHeader, baseMRTOptions } from "../../constants";
import {
    Alert,
    Avatar,
    Button,
    Chip,
    Container,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid2 as Grid,
    IconButton,
    Paper,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    AddCircle,
    Close,
    DeleteOutline,
    EditOutlined,
    Group,
    RestoreOutlined,
} from "@mui/icons-material";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { Copy, DisplayDateTime, Dropdown, Input, ShowSuccess } from "../Common";
import {
    allActiveClients,
    formatDateTime,
    formatDateTimeFieldAndAddSlNo,
    isDeepEqual,
    isValidDateTimeRange,
    prepareData,
} from "../../utils";
import serviceUserStore from "../../state/store/admin/serviceUsers";
import clientStore from "../../state/store/admin/clients/list";
import { makeStyles } from "@mui/styles";
import { DATE_TIME_FORMAT } from "../../config";
import { MaterialReactTable } from "material-react-table";
import Box from "@mui/material/Box";
import { Confirm } from "../../componentsV2/Common/Confirm";
import { ShowWarning } from "../../componentsV2/Common/Toast";

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

const ellipses = {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
};

const ACTIONS = {
    ADD: "Add",
    UPDATE: "Update",
};

const DisplayPassword = observer(() => {
    return (
        <>
            {Array.from(serviceUserStore.credentials?.entries())?.map(([key, credential]) => {
                return (
                    <Paper key={key} style={{ margin: "10px" }} elevation={3}>
                        <Alert key={key} variant="outlined" severity="info">
                            The new password for {credential?.userId} is {credential?.password}.
                            Make sure to copy this password now as you will not be able to see it
                            again.
                            <Copy text={credential?.password} icon={true} />
                        </Alert>
                    </Paper>
                );
            })}
        </>
    );
});

export const ServiceUsers = observer(() => {
    const [action, setAction] = React.useState(false);
    const [password, setPassword] = React.useState(false);
    const [clientList, setClientList] = React.useState([]);
    const [clientIdList, setClientIdList] = React.useState([]);
    React.useEffect(() => {
        fetchInitialData();
        return () => {
            serviceUserStore.resetCredentials();
        };
    }, []);

    async function fetchInitialData() {
        await serviceUserStore.load();
        await clientStore.loadAllClients();
        setClientList(clientStore.list);
    }

    const getClientName = clientIds => {
        const clients = clientStore.list;
        const filteredClients = clients?.filter(client => clientIds?.some(id => id === client?.id));
        return filteredClients?.map(client => {
            return client?.name;
        });
    };

    const prepareServiceUsersList = list => {
        const data = list?.map(entry => {
            return {
                ...entry,
                status: entry?.deleted ? "Deleted" : "Active",
                clients: getClientName(entry?.clientIdList),
            };
        });
        return data;
    };

    const serviceUsers = prepareServiceUsersList(serviceUserStore.list);
    return (
        <div>
            <AddServiceUsers
                action={action}
                setAction={setAction}
                serviceUsers={serviceUsers}
                setPassword={setPassword}
                clientList={clientList}
                setClientList={setClientList}
                clientIdList={clientIdList}
                setClientIdList={setClientIdList}
            />
            {password && <DisplayPassword />}
            <DisplayServiceUsers
                serviceUsers={serviceUsers}
                setAction={setAction}
                setPassword={setPassword}
                setClientIdList={setClientIdList}
            />
        </div>
    );
});

export const DisplayServiceUsers = observer(
    ({ serviceUsers, setAction, setPassword, setClientIdList }) => {
        // Column definitions for MRT
        const columns = useMemo(
            // Removed generic
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
                    filterFn: "contains",
                },
                {
                    accessorKey: "status",
                    header: "Status",
                    filterVariant: "select",
                    filterFn: "contains",
                },
                {
                    accessorKey: "expiry",
                    header: "Expiry",
                },
                {
                    accessorKey: "lastContactTime",
                    header: "Last Contact Time",
                },
                {
                    accessorKey: "clients",
                    header: "Clients",
                    filterFn: "contains",
                    enableSorting: false,
                    Cell: ({ cell }) => {
                        const value = cell.getValue();
                        return (
                            <div style={ellipses}>
                                {value &&
                                    value.map((val, key) => (
                                        <Chip
                                            variant="outlined"
                                            key={key}
                                            style={{ margin: "1px" }}
                                            label={val}
                                        />
                                    ))}
                            </div>
                        );
                    },
                },
            ],
            [serviceUsers]
        );

        const globalFilterFn = (row, columnId, filterValue) => {
            const search = filterValue?.toLowerCase()?.trim();

            if (!search) return true;

            const searchInValue = value => {
                if (value === null || value === undefined) return false;

                if (Array.isArray(value)) {
                    // Search in array elements
                    return value.some(item => searchInValue(item));
                } else if (typeof value === "object") {
                    // Search in object properties (though your data doesn't have nested objects)
                    return Object.values(value).some(val => searchInValue(val));
                } else {
                    // Search in primitive values
                    return String(value).toLowerCase().includes(search);
                }
            };

            return Object.values(row.original).some(value => searchInValue(value));
        };

        // MRT options combining base options with custom functionality
        const mrtOptions = {
            ...baseMRTOptions,
            renderTopToolbarCustomActions: () => (
                <Tooltip title="Add Service Users" aria-label="Add Service Users">
                    <Button
                        sx={{ borderRadius: 10 }}
                        variant="contained"
                        startIcon={<AddCircle />}
                        onClick={() => {
                            setAction(ACTIONS.ADD);
                            serviceUserStore.reset();
                        }}
                    >
                        Add
                    </Button>
                </Tooltip>
            ),
            enableRowActions: true,
            renderRowActions: ({ row }) => {
                const rowData = row.original;
                return (
                    <Box sx={{ display: "flex", gap: "0.5rem" }}>
                        {/* Reset Password Button */}
                        <Tooltip
                            title={
                                rowData?.deleted
                                    ? "Reset Password is not allowed for deleted entries"
                                    : "Reset Password"
                            }
                            aria-label="Reset Password"
                        >
                            <span>
                                <IconButton
                                    onClick={async () => {
                                        const { isConfirmed } = await Confirm(
                                            "Reset Password",
                                            `Please confirm you want to reset password for ${rowData?.userId}. Make sure to note down the new password once reset it complete.`
                                        );
                                        if (isConfirmed) {
                                            const success = await serviceUserStore.resetPassword(
                                                rowData?.id
                                            );
                                            success &&
                                                ShowSuccess("Password reseted successfully.");
                                            setPassword(true);
                                        }
                                    }}
                                    disabled={rowData?.deleted}
                                >
                                    <VpnKeyIcon />
                                </IconButton>
                            </span>
                        </Tooltip>

                        {/* Edit Button */}
                        <Tooltip
                            title={
                                rowData?.deleted
                                    ? "Editing is not allowed for deleted entries"
                                    : "Edit Service User"
                            }
                            aria-label="Edit Service User"
                        >
                            <span>
                                <IconButton
                                    onClick={() => {
                                        setAction(ACTIONS.UPDATE);
                                        const serviceUser = { ...rowData };
                                        delete serviceUser.slNo;
                                        serviceUserStore.set(serviceUser);
                                        setClientIdList(serviceUser?.clientIdList);
                                    }}
                                    disabled={rowData?.deleted}
                                >
                                    <EditOutlined />
                                </IconButton>
                            </span>
                        </Tooltip>

                        {/* Delete/Restore Button */}
                        {rowData?.deleted ? (
                            <Tooltip title="Restore Service User" aria-label="Restore Service User">
                                <IconButton
                                    onClick={async () => {
                                        const { isConfirmed } = await Confirm(
                                            "Restore Service User",
                                            `Please confirm you want to restore ${rowData?.userId}`
                                        );
                                        if (isConfirmed) {
                                            await serviceUserStore.restore(rowData?.id);
                                            ShowSuccess("Service User Restored");
                                        }
                                    }}
                                >
                                    <RestoreOutlined />
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Delete Service User" aria-label="Delete Service User">
                                <IconButton
                                    onClick={async () => {
                                        const { isConfirmed } = await Confirm(
                                            "Delete Service User",
                                            `Please confirm you want to delete ${rowData?.userId}`
                                        );
                                        if (isConfirmed) {
                                            const success = await serviceUserStore.remove(
                                                rowData?.id
                                            );
                                            success && ShowSuccess("Service User Deleted");
                                        }
                                    }}
                                >
                                    <DeleteOutline />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                );
            },
            muiTableProps: {
                ...baseMRTOptions.muiTableProps,
            },
        };

        return (
            <MaterialReactTable
                columns={columns}
                data={formatDateTimeFieldAndAddSlNo(serviceUsers, ["expiry", "lastContactTime"])}
                enableGlobalFilter={true}
                filterFns={{
                    custom: globalFilterFn, // Define your custom function here
                }}
                enableColumnFilters={serviceUsers?.length > 0}
                enableSorting={serviceUsers?.length > 0}
                enableColumnActions={serviceUsers?.length > 0}
                showGlobalFilter={serviceUsers?.length > 0}
                {...mrtOptions}
            />
        );
    }
);

export const AddServiceUsers = observer(
    ({
        action,
        setAction,
        serviceUsers,
        setPassword,
        clientList,
        setClientList,
        clientIdList,
        setClientIdList,
    }) => {
        const isServiceUserUpdated = updateServiceUser => {
            const target = serviceUsers?.find(s => s?.id === serviceUserStore.serviceUser?.id);
            const currServiceUser = { ...target };
            delete currServiceUser?.expiry;
            delete currServiceUser?.lastContactTime;

            return !isDeepEqual(updateServiceUser, currServiceUser);
        };

        const classes = useStyles();

        const [selectedClient, setClient] = React.useState("");

        const validateServiceUser = () => {
            if (serviceUserStore.serviceUser?.userId === "") {
                ShowWarning("Service User ID cannot be empty");
                return false;
            }

            if (!isValidDateTimeRange(serviceUserStore.serviceUser?.expiry)) {
                ShowWarning("Invalid date range, please correct the dates and try again");
                return false;
            }
            return true;
        };

        const handleServiceUserChange = async e => {
            e.preventDefault();
            const isServiceUserValid = validateServiceUser();

            const payload = {
                ...serviceUserStore.serviceUser,
                expiry: formatDateTime(serviceUserStore.serviceUser?.expiry, DATE_TIME_FORMAT),
                clientIdList: clientIdList,
            };

            const message =
                action === ACTIONS.ADD
                    ? "Service User added successfully"
                    : "Service User updated successfully";

            if (isServiceUserValid) {
                const success =
                    action === ACTIONS.ADD
                        ? await serviceUserStore.add(payload)
                        : isServiceUserUpdated(payload) && (await serviceUserStore.update(payload));
                if (success) {
                    ShowSuccess(message);
                    setPassword(true);
                }
                setAction("");
                setClientIdList([]);
            }
        };

        const handleClose = () => {
            serviceUserStore.reset();
            setAction("");
            setClientIdList([]);
        };

        const handleClientList = async e => {
            setClient(e.target.value);
            setClientIdList([...clientIdList, e.target.value]);
            const remainingClients = clientStore.list?.filter(
                client => client?.id !== selectedClient
            );
            setClientList(remainingClients);
            setClient("");
        };

        const getClientName = clientId => {
            const client = clientStore.list?.find(client => client?.id === clientId);
            return client?.name;
        };

        const handleDelete = async index => {
            const { isConfirmed } = await Confirm(
                "Remove Client",
                "Please confirm you want to remove this client for this service user."
            );
            if (isConfirmed) {
                const list = [...clientIdList];
                list[index] = "";

                list.splice(index, 1);
                setClientIdList(list);
            }
        };

        const remainingActiveClients = () => {
            const remainingClients = clientList?.filter(
                client => !clientIdList?.includes(client?.id)
            );
            return allActiveClients(remainingClients);
        };

        const dropdownOption = prepareData(remainingActiveClients(), {
            value: "id",
            label: "name",
        });

        return (
            <Container component="main" maxWidth="lg" sx={{ paddingBottom: "3rem" }}>
                <CssBaseline />
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <Group />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        {adminServiceUsersTableHeader}
                    </Typography>
                </div>
                <Dialog
                    onClose={handleClose}
                    aria-labelledby="customized-dialog-title"
                    open={action === ACTIONS.ADD || action === ACTIONS.UPDATE}
                >
                    <DialogTitle sx={{ m: 0, p: 2 }}>
                        {`${action} Service User`}
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
                            <Close />
                        </IconButton>
                    </DialogTitle>
                    <div className={classes.paper}>
                        <DialogContent dividers>
                            <Typography gutterBottom component="div">
                                <Input
                                    name="Service User Name"
                                    label="Service User Name"
                                    value={serviceUserStore.serviceUser?.userId}
                                    onChange={e => {
                                        serviceUserStore.set({
                                            ...serviceUserStore.serviceUser,
                                            userId: e.target.value,
                                        });
                                    }}
                                />

                                <DisplayDateTime
                                    selectedDate={new Date(serviceUserStore.serviceUser?.expiry)}
                                    name="Expiry Date"
                                    handleDateChange={newValue => {
                                        serviceUserStore.set({
                                            ...serviceUserStore.serviceUser,
                                            expiry: newValue,
                                        });
                                    }}
                                    ariaLabel="Expiry Date"
                                    label="Expiry Date"
                                />

                                <Dropdown
                                    ddLabel="Client"
                                    labelName="Client"
                                    labelValue="Client"
                                    value={selectedClient}
                                    handleChange={handleClientList}
                                    dropdownOptions={dropdownOption}
                                />
                                {clientIdList?.map((cl, i) => {
                                    return (
                                        <Chip
                                            className={classes.formControl}
                                            key={i}
                                            name="client"
                                            label={getClientName(cl)}
                                            onDelete={() => {
                                                handleDelete(i);
                                            }}
                                            deleteIcon={<DeleteOutline />}
                                            variant="outlined"
                                        />
                                    );
                                })}
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
                                    onClick={e => handleServiceUserChange(e)}
                                >
                                    {action}
                                </Button>
                            </Grid>
                        </Grid>
                    </DialogActions>
                </Dialog>
            </Container>
        );
    }
);
