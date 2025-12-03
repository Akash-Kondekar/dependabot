import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { observer } from "mobx-react";
import session from "../../state/store/session";
import {
    Alert,
    Autocomplete,
    Backdrop,
    Container,
    CssBaseline,
    Fade,
    Modal,
    TextField,
    Typography,
} from "@mui/material";
import { BasicButton, Dropdown, Input, ShowSuccess } from "../Common/index.js";
import ProjectList from "../../state/store/projects/list";
import { allActiveClients, prepareData } from "../../utils";
import user from "../../state/store/user";
import UserList from "../../state/store/admin/users";
import users from "../../state/store/admin/users";
import { STATUS_FILTER, SYSTEM_ROLE } from "../../constants";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { ShowWarning } from "../../componentsV2/Common/Toast";

const MenuProps = {
    anchorOrigin: {
        vertical: "bottom",
        horizontal: "center",
    },
    getContentAnchorEl: null,
    PaperProps: {
        style: {
            maxHeight: "30vh",
        },
    },
};

const useStyles = makeStyles(theme => ({
    modal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: "1px solid #424242",
        boxShadow: theme.shadows[5],
        zIndex: "inherit",
        padding: theme.spacing(2, 4, 3),
    },
    buttons: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "5px",
    },
}));

const NewProject = observer(({ open, handleClose }) => {
    const classes = useStyles();
    const [name, setName] = React.useState("");
    const [list, setList] = React.useState("");
    const [selectedClient, setClient] = React.useState("");
    const [owner, setOwner] = React.useState("");

    const currentTheme = useTheme();

    const theme = createTheme({
        palette: {
            mode: currentTheme.palette.mode,
        },
        components: {
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        textTransform: "capitalize",
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        textTransform: "capitalize",
                    },
                },
            },
        },
    });

    React.useEffect(() => {
        (async () => {
            await users.load();
            session.isAdmin && !users.allClientDetailsFetched && (await users.loadAllClients());
        })();
    }, []);

    React.useEffect(() => {
        (async () => {
            if (session.isAdmin && selectedClient !== "") {
                UserList.setFilters({
                    clients: [selectedClient],
                    roles: [SYSTEM_ROLE.MODERATOR, SYSTEM_ROLE.USER],
                    status: STATUS_FILTER.ACTIVE,
                });

                await UserList.load();

                const eligibleUsers =
                    UserList.list &&
                    prepareData(UserList.list, {
                        value: "userID",
                        label: "userFullName",
                    });
                setList(eligibleUsers);
            }
        })();
    }, [selectedClient]);

    const handleSave = async () => {
        const projectName = name.trim();

        if (session.isAdmin) {
            if (!selectedClient || selectedClient === "") {
                return ShowWarning("Please select a client");
            }

            if (owner === "") {
                return ShowWarning("Please select an owner");
            }
        }

        if (projectName.length === 0) {
            return ShowWarning("enter a valid name");
        }

        const payload = {
            projectName,
            clientID: user.clientDetails?.clientId,
        };

        if (session.isAdmin) {
            payload.clientID = selectedClient;
            payload.projectOwnerID = owner?.value;
        }

        const result = await ProjectList.create(payload);

        if (result) {
            ShowSuccess("project created");
            handleClose();
        }
    };

    const noClients = session.isAdmin && allActiveClients?.length === 0;

    const canSave = !noClients;

    const displayErrorMessage = () => {
        if (noClients) {
            return "No eligible clients found.";
        }
        return "";
    };

    return (
        <Modal
            disableEscapeKeyDown
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
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
            <Fade in={open}>
                <div
                    className={classes.paper}
                    style={{
                        width: "40%",
                        padding: "0px 0px 16px 0px",
                        marginTop: "16px",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#1976d2",
                            color: "white",
                            textAlign: "center",
                            padding: "10px",
                        }}
                    >
                        <Typography variant="h6" component="h6">
                            Create Project
                        </Typography>
                    </div>

                    <Container component="main" fixed maxWidth={false} sx={{ paddingTop: "10px" }}>
                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                handleSave();
                            }}
                            style={{ padding: "0px 6%" }}
                        >
                            <CssBaseline />

                            <Input
                                name="Project Name"
                                onChange={e => {
                                    setName(e.target.value);
                                }}
                                inputProps={{
                                    pattern: "[A-Za-z0-9_]+",
                                }}
                                label="Alphanumeric and Underscore Allowed (No Spaces)"
                                required={true}
                            />

                            {session.isAdmin && (
                                <ThemeProvider theme={theme}>
                                    <Dropdown
                                        formControlClassName={classes.formControl}
                                        ddLabel="Client"
                                        labelName="Client"
                                        value={selectedClient}
                                        labelValue="Client"
                                        handleChange={e => {
                                            setClient(e.target.value);
                                            setOwner("");
                                        }}
                                        dropdownOptions={prepareData(
                                            allActiveClients(users.listOfClients),
                                            {
                                                value: "id",
                                                label: "name",
                                            }
                                        )}
                                        disabled={noClients}
                                        MenuProps={MenuProps}
                                    />
                                </ThemeProvider>
                            )}

                            {session.isAdmin && (
                                <ThemeProvider theme={theme}>
                                    <Autocomplete
                                        disabled={selectedClient === ""}
                                        options={list}
                                        getOptionKey={option => (option ? option.value : "")}
                                        getOptionLabel={option => (option ? option.label : "")}
                                        value={owner}
                                        onChange={(e, newValue) => {
                                            setOwner(newValue || "");
                                        }}
                                        sx={{
                                            marginTop: "8px",
                                            marginBottom: "8px",
                                            minWidth: 200,
                                        }}
                                        renderInput={params => (
                                            <TextField {...params} label="Owner" />
                                        )}
                                    />
                                </ThemeProvider>
                            )}

                            <div style={{ marginTop: "10%" }}>
                                {noClients && (
                                    <Alert
                                        severity="error"
                                        sx={{
                                            backgroundColor: "inherit",
                                            justifyContent: "flex-end",
                                            fontSize: "large",
                                        }}
                                    >
                                        {displayErrorMessage()}
                                    </Alert>
                                )}
                                <div className={classes.buttons}>
                                    <BasicButton
                                        variant="outlined"
                                        handleClick={() => handleClose()}
                                        buttonText="Cancel"
                                        style={{ marginRight: "1%" }}
                                    />
                                    <BasicButton
                                        handleClick={() => {}}
                                        buttonText="Save"
                                        type="submit"
                                        disabled={!canSave}
                                    />
                                </div>
                            </div>
                        </form>
                    </Container>
                </div>
            </Fade>
        </Modal>
    );
});

export default NewProject;
