import React, { useMemo } from "react";
import { observer } from "mobx-react";
import session from "../../state/store/session";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import { Confirm } from "../Common/Confirm";
import { addSlNo, prepareData } from "../../utils";
import {
    ADD_USERS,
    baseMRTOptions,
    PROJECT_ROLE,
    radioOptionsProjectUserRole,
} from "../../constants";
import { Input } from "../Common/Input.jsx";
import { BasicButton } from "../Common/BasicButton.jsx";
import { useTheme } from "@mui/material/styles";
import projectDetails from "../../state/store/projects/details.js";
import Grid from "@mui/material/Grid2";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { DialogBox } from "../Common/DialogBox.jsx";
import {
    MaterialReactTable,
    MRT_ToggleFiltersButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable,
} from "material-react-table";
import { Radiogroup } from "../../components/Common/index.js";
import Container from "@mui/material/Container";
import { DeleteOutline } from "@mui/icons-material";
import RemoveOutlined from "@mui/icons-material/RemoveOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import Typography from "@mui/material/Typography";

export const AddUser = observer(({ results, projectID }) => {
    const [userType, setUserType] = React.useState("1");
    const [user, setUser] = React.useState("");

    const handleDDChange = value => {
        setUser(value || "");
    };

    const handleChange = value => {
        setUserType(value);
    };

    const addUser = async () => {
        const payload = {
            userId: user?.value,
            role: userType,
        };
        await projectDetails.saveTeam(projectID, payload);
        setUser("");
    };

    const AddNewUser = () => {
        return (
            <Box gap={2}>
                <Autocomplete
                    options={results}
                    getOptionKey={option => (option ? option.value : "")}
                    getOptionLabel={option => (option ? option.label : "")}
                    value={user}
                    onChange={(e, newValue) => {
                        handleDDChange(newValue);
                    }}
                    renderInput={params => <Input {...params} label="Select a user to add" />}
                    sx={{ mb: 2 }}
                />
                <Typography>Assign Role</Typography>
                <Radiogroup
                    name="Assign role"
                    radioOptions={radioOptionsProjectUserRole}
                    value={userType}
                    handleChange={e => handleChange(e.target.value)}
                />
                <br />
                <Box justifyContent="flex-end" display="flex">
                    <BasicButton
                        disabled={user === ""}
                        handleClick={e => addUser(e)}
                        buttonText="Add"
                    />
                </Box>
            </Box>
        );
    };

    return (
        <>
            <form noValidate autoComplete="off">
                <Container role="presentation">
                    <br />
                    {results?.length > 0 ? <AddNewUser /> : <h3>No new users found to add</h3>}
                    <br />
                </Container>
            </form>
        </>
    );
});

export const FetchAndDisplayUsersToBeAdded = observer(props => {
    React.useEffect(() => {
        async function fetchData() {
            await projectDetails.loadNonProjectUsers(props.projectID);
        }
        fetchData();
    }, [props.projectID]);

    return (
        <AddUser
            results={prepareData(projectDetails.nonusers, {
                value: "userId",
                label: "userFullName",
            })}
            {...props}
        />
    );
});

export function AddUsersDrawer(props) {
    const [displayDialog, setDisplayDialog] = React.useState(false);
    const { isActiveClient } = props;

    const toggleDialog = open => () => {
        setDisplayDialog(open);
    };

    return (
        <>
            <BasicButton
                variant="outlined"
                handleClick={toggleDialog(true)}
                buttonText={ADD_USERS}
                sx={{ marginBottom: "10px" }}
                disabled={!projectDetails.activeProject || !isActiveClient}
            />
            <DialogBox
                open={displayDialog}
                handleClose={toggleDialog(false)}
                title={ADD_USERS}
                fullWidth
                maxWidth="sm"
                Content={<FetchAndDisplayUsersToBeAdded {...props} />}
            />
        </>
    );
}

const ProjectTeam = observer(props => {
    const { isActiveClient } = props;
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const baseBackgroundColor = isDarkMode ? theme.palette.grey.main : theme.palette.grey.light;

    // Ensure team is loaded on first render and when projectID changes
    React.useEffect(() => {
        async function fetchData() {
            await projectDetails.loadTeam(props.projectID);
        }
        if (props?.projectID && (!projectDetails.team || projectDetails.team?.length === 0)) {
            fetchData();
        }
    }, [props?.projectID]);

    const results = projectDetails.team || [];

    const columns = useMemo(
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
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                size: 200,
            },
            {
                accessorKey: "userFullName",
                header: "User Name",
                enableColumnFilter: true,
                enableSorting: true,
                filterVariant: "autocomplete",
                size: 200,
            },
            {
                accessorKey: "roleDescription",
                header: "Role",
                enableColumnFilter: true,
                enableSorting: true,
                size: 150,
                filterVariant: "select",
            },
        ],
        [props.projectID]
    );

    const hasData = results?.length > 0;

    const data = useMemo(() => addSlNo(results), [results]);

    const table = useMaterialReactTable({
        columns,
        data,
        enableColumnFilters: () => data?.length > 0,
        ...baseMRTOptions,
        renderToolbarInternalActions: ({ table }) => (
            <Box>
                {/* add users button  */}
                {(projectDetails.isProjectOwner || session.isAdmin) && (
                    <AddUsersDrawer {...props} />
                )}
                {/* along-side built-in buttons in whatever order you want them */}
                <MRT_ToggleGlobalFilterButton table={table} />
                <MRT_ToggleFiltersButton table={table} />
            </Box>
        ),
        muiTablePaperProps: {
            elevation: 0,
            sx: {
                borderRadius: "32px",
                border: "0",
            },
        },
        mrtTheme: () => ({
            baseBackgroundColor: baseBackgroundColor,
        }),
        enableRowActions: () => true,
        renderRowActions: ({ row }) => {
            const rowData = row.original;
            const { isProjectOwner, activeProject } = projectDetails;

            /**
             * This function will check if.
             * Client is Active
             * And Project is active
             * And change being done is not against Owner of the project.
             */
            const allowAction = () => {
                if (!isActiveClient) {
                    return false;
                }

                // If its not an active project, no one can delete
                if (!activeProject) {
                    return false;
                }
                // From here on, its an active project & client

                return rowData.role !== PROJECT_ROLE.OWNER;
            };

            /**
             * This function is written in a proper sequence.
             * And it makes a lot of decision based on the sequence.
             * If the sequence needs to be modified, please test the requirements properly.
             */
            const canDelete = () => {
                // If its not an active client, no one can delete
                if (!allowAction()) {
                    return false;
                }

                if (session.isAdmin || isProjectOwner) {
                    // Allow Admin/Project Owner to delete other roles except owner.
                    return rowData.role !== PROJECT_ROLE.OWNER;
                }

                return false; // Block delete by default
            };

            const canChangeRole = () => {
                if (!allowAction()) {
                    return false;
                }

                if (session.isAdmin || isProjectOwner) {
                    // Allow Admin/Project Owner to change other roles.
                    return rowData.role !== PROJECT_ROLE.OWNER;
                }

                return false; // Block changing role by default
            };

            const roleChangeLabel =
                rowData.role === PROJECT_ROLE.VIEW_ONLY ? "Change to Co Owner" : "Change to User";

            return (
                <Box>
                    {canDelete() && (
                        <Tooltip title="Remove user from project">
                            <IconButton
                                aria-label="Remove user from project"
                                onClick={async () => {
                                    const { isConfirmed } = await Confirm(
                                        "Remove Team Member",
                                        "Are you sure you want to this team member"
                                    );
                                    if (isConfirmed) {
                                        await projectDetails.removeTeamMember(
                                            props.projectID,
                                            rowData.userId
                                        );
                                    }
                                }}
                            >
                                <DeleteOutline />
                            </IconButton>
                        </Tooltip>
                    )}

                    {canChangeRole() && (
                        <Tooltip title={roleChangeLabel}>
                            <IconButton
                                aria-label={roleChangeLabel}
                                onClick={async () => {
                                    const role = rowData.role === 2 ? "1" : "2";
                                    const payload = {
                                        userId: rowData.userId,
                                        role,
                                    };
                                    await projectDetails.modifyTeamMember(props.projectID, payload);
                                }}
                            >
                                {rowData.role === 2 ? <RemoveOutlined /> : <AddOutlined />}
                            </IconButton>
                        </Tooltip>
                    )}
                    {!canDelete() && !canChangeRole() && (
                        <Typography fontWeight="300" fontSize={14} component="span">
                            Not allowed
                        </Typography>
                    )}
                </Box>
            );
        },
    });

    if (!hasData) {
        return (
            <Grid
                container
                spacing={3}
                direction="column"
                justifyContent="center"
                alignItems="center"
            >
                <Grid>No users found.</Grid>
                <Grid>
                    {(projectDetails.isProjectOwner || session.isAdmin) && (
                        <AddUsersDrawer {...props} />
                    )}
                </Grid>
            </Grid>
        );
    }

    return (
        <MaterialReactTable
            table={table}
            enableColumnFilters={hasData}
            enableSorting={hasData}
            enableColumnActions={hasData}
            showGlobalFilter={hasData}
        />
    );
});

export default ProjectTeam;
