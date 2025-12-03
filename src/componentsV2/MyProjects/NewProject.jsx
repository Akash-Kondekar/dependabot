import React from "react";
import { observer } from "mobx-react";
import session from "../../state/store/session";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ProjectList from "../../state/store/projects/list";
import { allActiveClients, prepareData } from "../../utils";
import user from "../../state/store/user";
import UserList from "../../state/store/admin/users";
import users from "../../state/store/admin/users";
import { STATUS_FILTER, SYSTEM_ROLE } from "../../constants";
import { Input } from "../Common/Input.jsx";
import { BasicButton } from "../Common/BasicButton.jsx";
import { DialogBox } from "../Common/DialogBox.jsx";
import { ShowSuccess, ShowWarning } from "../Common/Toast";

const NewProject = observer(({ open, handleClose }) => {
    const [name, setName] = React.useState("");
    const [list, setList] = React.useState("");
    const [selectedClient, setClient] = React.useState("");
    const [owner, setOwner] = React.useState("");

    React.useEffect(() => {
        (async () => {
            if (session.isAdmin) {
                await users.load();
                !users.allClientDetailsFetched && (await users.loadAllClients());
            }
        })();
    }, []);

    React.useEffect(() => {
        (async () => {
            if (session.isAdmin && selectedClient !== "") {
                UserList.setFilters({
                    clients: [selectedClient.value],
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

            if (!owner) {
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
            payload.clientID = selectedClient.value;
            payload.projectOwnerID = owner.value;
        }

        const result = await ProjectList.create(payload);

        if (result) {
            ShowSuccess("project created");
            handleClose();
        }
    };

    const handleFormSubmit = e => {
        e.preventDefault();
        handleSave();
    };

    const noClients = session.isAdmin && allActiveClients?.length === 0;
    const canSave = !noClients;

    const displayErrorMessage = () => {
        return "Cannot create project without an active client.";
    };

    // Directly render JSX instead of creating a component inside the component
    const dialogContent = (
        <Box
            component="form"
            onSubmit={handleFormSubmit}
            sx={{
                px: 4,
                py: 3,
                display: "flex",
                flexDirection: "column",
                gap: 1,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ minWidth: 120, textAlign: "left" }}>
                    <strong>Project Name</strong>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Input
                        name="Project Name"
                        onChange={e => {
                            setName(e.target.value);
                        }}
                        inputProps={{
                            pattern: "[A-Za-z0-9_]+",
                        }}
                        label="Alphanumeric and underscore allowed. (No Spaces)"
                        required={true}
                        value={name}
                    />
                </Box>
            </Box>

            {session.isAdmin && !noClients && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ minWidth: 120, textAlign: "left" }}>
                        <strong>Client</strong>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Autocomplete
                            disablePortal
                            value={selectedClient}
                            getOptionKey={option => (option ? option.value : "")}
                            getOptionLabel={option => (option ? option.label : "")}
                            onChange={(e, newValue) => {
                                setClient(newValue || "");
                                setOwner("");
                            }}
                            options={
                                prepareData(allActiveClients(users.listOfClients), {
                                    value: "id",
                                    label: "name",
                                }) || []
                            }
                            disabled={noClients}
                            renderInput={params => (
                                <Input
                                    {...params}
                                    label="Client"
                                    inputProps={{
                                        ...params.inputProps,
                                        role: "textbox",
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            textTransform: "capitalize",
                                        },
                                    }}
                                />
                            )}
                            sx={{
                                "& .MuiMenuItem-root": {
                                    textTransform: "capitalize",
                                },
                            }}
                        />
                    </Box>
                </Box>
            )}

            {session.isAdmin && !noClients && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ minWidth: 120, textAlign: "left" }}>
                        <strong>Owner</strong>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Autocomplete
                            disablePortal
                            disabled={selectedClient === ""}
                            options={list || []}
                            getOptionKey={option => (option ? option.value : "")}
                            getOptionLabel={option => (option ? option.label : "")}
                            value={owner}
                            onChange={(e, newValue) => {
                                setOwner(newValue || "");
                            }}
                            renderInput={params => (
                                <Input
                                    {...params}
                                    label="Owner"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            textTransform: "capitalize",
                                        },
                                    }}
                                    inputProps={{
                                        ...params.inputProps,
                                        role: "textbox",
                                    }}
                                    role="textbox"
                                />
                            )}
                            sx={{
                                "& .MuiMenuItem-root": {
                                    textTransform: "capitalize",
                                },
                            }}
                        />
                    </Box>
                </Box>
            )}

            {noClients && (
                <Alert
                    severity="error"
                    sx={{
                        mt: 2,
                        backgroundColor: "transparent",
                    }}
                >
                    {displayErrorMessage()}
                </Alert>
            )}

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                <BasicButton
                    type="submit"
                    variant="contained"
                    disabled={!canSave}
                    sx={{
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        borderRadius: 1.5,
                    }}
                    buttonText="Create"
                    handleClick={() => {}}
                />
            </Stack>
        </Box>
    );

    return (
        <DialogBox
            open={open}
            handleClose={(event, reason) => {
                if (reason !== "backdropClick") {
                    handleClose(event, reason);
                }
            }}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown
            title={"Create new project"}
            Content={dialogContent} // Pass JSX directly, not a component
        />
    );
});

export default NewProject;
