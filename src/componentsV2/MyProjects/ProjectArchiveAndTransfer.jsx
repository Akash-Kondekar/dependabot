import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import projectDetails from "../../state/store/projects/details.js";
import { observer } from "mobx-react";
import Stack from "@mui/material/Stack";
import { BasicButton } from "../Common/BasicButton.jsx";
import Box from "@mui/material/Box";
import { prepareData } from "../../utils/index.jsx";
import { PROJECT_ROLE } from "../../constants/index.jsx";
import Autocomplete from "@mui/material/Autocomplete";
import Alert from "@mui/material/Alert";
import { Input } from "../Common/Input.jsx";
import events from "../../lib/events.js";
import session from "../../state/store/session.js";
import { useNavigate } from "react-router-dom";
import { ShowSuccess } from "../Common/Toast.jsx";
import { Confirm } from "../Common/Confirm.jsx";

const ProjectArchiveAndTransfer = observer(props => {
    const [eligibleOwners, setEligibleOwners] = useState([]);
    const [showTransfer, setShowTransfer] = useState(false);
    const [newOwnerDropdownIndex, setNewOwnerDropdownIndex] = React.useState(null);
    const [newOwnerDetails, setNewOwnerDetails] = React.useState();
    const navigate = useNavigate();
    const projectActionLabel = projectDetails.activeProject ? "Archive" : "Restore";
    const deleteThisProjectButtonColor = projectDetails.activeProject ? "error" : "success";
    const { isActiveClient } = props;

    const updateStatus = async () => {
        const isRestoring = !projectDetails.activeProject;
        const action = isRestoring ? "Restore" : "Archive";
        const actionPastTense = isRestoring ? "Restored" : "Archived";
        const actionLowercase = action.toLowerCase();

        const { isConfirmed } = await Confirm(
            `${action} Project`,
            `Are you sure you want to ${actionLowercase} this project?`
        );

        if (!isConfirmed) return;

        const results = isRestoring
            ? await projectDetails.reactivate(projectDetails.data.projectID)
            : await projectDetails.delete(projectDetails.data.projectID);

        if (results) {
            ShowSuccess(`Project ${actionPastTense}`);
            projectDetails.resetProject();
            navigate("/projects/new");
        }
    };

    const onClickShowTransfer = () => {
        // Toggle the transfer ownership component
        setShowTransfer(!showTransfer);

        // If transfer ownership component is visible
        if (showTransfer === false) {
            // Select current team members except the current project owner
            setEligibleOwners(
                prepareData(
                    projectDetails.team?.filter(a => a.role !== PROJECT_ROLE.OWNER),
                    { value: "userId", label: "userFullName" }
                )
            );
        }
    };

    const handleDDChange = value => {
        setNewOwnerDropdownIndex(value);
        setNewOwnerDetails(value);
    };

    async function transferTheProject() {
        const role = PROJECT_ROLE.OWNER;
        const payload = {
            userId: newOwnerDetails.value,
            role,
        };
        const result = await projectDetails.transferOwnership(props.projectID, payload);
        setShowTransfer(false);
        if (result) {
            ShowSuccess("Project ownership has been transferred");
            events.emit("reset.jobs", []);
            projectDetails.resetProject();
            session.unsubscribeFromProjectUpdates(projectDetails.subscribedProject);
            navigate("/projects/new");
        }
    }

    const TransferOwnership = observer(() => {
        const cannotTransferProject =
            !isActiveClient || !newOwnerDetails || !projectDetails.activeProject;

        return (
            <Box p={1} sx={{ borderRadius: 8, bgcolor: "background.default", marginY: "20px" }}>
                <Stack
                    spacing={3}
                    direction="row"
                    sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                    }}
                >
                    <Typography sx={{ fontSize: "22px" }}>
                        Transfer ownership of this project
                    </Typography>
                    <BasicButton
                        variant="outlined"
                        handleClick={async () => {
                            if (showTransfer === false) {
                                if (!projectDetails.team || projectDetails.team?.length === 0) {
                                    await projectDetails.loadTeam(props.projectID);
                                }
                            } else {
                                setNewOwnerDetails(undefined);
                                setNewOwnerDropdownIndex(null);
                            }
                            onClickShowTransfer();
                        }}
                        buttonText={showTransfer ? "Cancel" : "Transfer"}
                        style={{ display: "flex" }}
                        disabled={!isActiveClient || !projectDetails.activeProject}
                    />
                </Stack>
                {showTransfer && (
                    <>
                        {eligibleOwners && eligibleOwners.length > 0 ? (
                            <>
                                <Stack
                                    spacing={3}
                                    direction="row"
                                    sx={{
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        p: 2,
                                    }}
                                >
                                    <Typography variant="body1">
                                        Select a person you would like to transfer the ownership to
                                    </Typography>
                                    <Autocomplete
                                        size={"small"}
                                        options={eligibleOwners}
                                        getOptionLabel={option => option.label}
                                        value={newOwnerDropdownIndex}
                                        onChange={(e, newValue) => handleDDChange(newValue)}
                                        sx={{ width: 300 }}
                                        renderInput={params => <Input {...params} label="search" />}
                                    />
                                </Stack>
                                <Stack
                                    spacing={2}
                                    direction="column"
                                    sx={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        p: 1,
                                    }}
                                >
                                    <Alert
                                        variant="outlined"
                                        severity="info"
                                        sx={{ borderRadius: 8 }}
                                    >
                                        You will be redirected to My Projects page once you transfer
                                        ownership
                                    </Alert>
                                    <>
                                        {newOwnerDetails && (
                                            <>
                                                <Typography variant="body1">
                                                    You are transferring the ownership to{" "}
                                                    <b>
                                                        {newOwnerDetails
                                                            ? newOwnerDetails?.label +
                                                              " <" +
                                                              newOwnerDetails?.value +
                                                              ">"
                                                            : ""}
                                                    </b>
                                                </Typography>
                                            </>
                                        )}
                                    </>
                                    <BasicButton
                                        handleClick={async () => {
                                            const { isConfirmed } = await Confirm(
                                                "Transfer the project",
                                                "Are you sure you want to transfer the project to " +
                                                    newOwnerDetails?.label +
                                                    "?"
                                            );
                                            if (isConfirmed) {
                                                transferTheProject();
                                            } else {
                                                setNewOwnerDetails(undefined);
                                                setNewOwnerDropdownIndex(undefined);
                                            }
                                        }}
                                        buttonText={"Transfer this project"}
                                        disabled={cannotTransferProject}
                                    />
                                </Stack>
                            </>
                        ) : (
                            <Box sx={{ justifyItems: "flex-start", p: 2, textAlign: "left" }}>
                                <Typography variant="body1">
                                    <b>No eligible team member found.</b> Please add the intended
                                    person to the project first, and then try again.
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        );
    });

    return (
        <Box p={1} m={1}>
            <Box p={1} sx={{ borderRadius: 8, bgcolor: "background.default", marginTop: "20px" }}>
                <Stack
                    spacing={3}
                    direction="row"
                    sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                    }}
                >
                    <Typography
                        sx={{ fontSize: "22px" }}
                    >{`${projectActionLabel} this project`}</Typography>
                    <BasicButton
                        variant="outlined"
                        color={deleteThisProjectButtonColor}
                        handleClick={() => updateStatus()}
                        buttonText={`${projectActionLabel} this project`}
                        disabled={!isActiveClient}
                    />
                </Stack>
            </Box>

            <TransferOwnership />
        </Box>
    );
});

export default ProjectArchiveAndTransfer;
