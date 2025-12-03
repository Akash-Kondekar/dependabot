import React, { useState } from "react";

import {
    Alert,
    Autocomplete,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    TextField,
    Tooltip,
} from "@mui/material";
import { BasicButton } from "../../Common";
import { prepareData } from "../../../utils";
import userStore from "../../../state/store/user";
import { PHENOTYPE_STATE } from "../../../constants";
import ShareIcon from "@mui/icons-material/Share";
import { ShowWarning } from "../../../componentsV2/Common/Toast";

export const DisplayDialogue = ({
    store,
    selectedUserTags,
    richTextContent,
    title,
    canShare,
    codeForAction,
    setRowsChecked,
    rowsChecked,
}) => {
    const [selectedReviewer, setSelectedReviewer] = useState("");

    const [displayDialogue, setDisplayDialogue] = useState(false);

    const handleClose = () => {
        setDisplayDialogue(false);
    };

    const toggleDialogue = async () => {
        await userStore.getEligibleReviewers();
        setDisplayDialogue(true);
    };

    const handleSubmit = async () => {
        const selectedCode = Array.isArray(codeForAction) ? codeForAction : [codeForAction];

        if (selectedCode.length === 0) {
            // No Rows to save or File name is blank
            return;
        }

        const selectedCodeToSubmit = selectedCode[0];

        if (selectedCodeToSubmit?.owner === selectedReviewer?.value) {
            return ShowWarning("Reviewer and owner cannot be same.");
        }

        const payload = {
            id: selectedCodeToSubmit.id,
            filename: selectedCodeToSubmit.name,
            finalData: [],
            tags: selectedUserTags,
            document: richTextContent,
            reviewer: selectedReviewer?.value,
            status: PHENOTYPE_STATE.UNDER_REVIEW,
            userId: selectedCodeToSubmit.owner,
        };

        await store.update(payload, PHENOTYPE_STATE.UNDER_REVIEW);
        setDisplayDialogue(false);
        store.setCodeDetailsToView({
            ...store.codeToView,
            status: PHENOTYPE_STATE.UNDER_REVIEW,
            reviewer: selectedReviewer?.value,
        });

        const target = codeForAction.findIndex(code => code.id === payload.id);
        codeForAction[target] = { ...codeForAction[target], status: PHENOTYPE_STATE.UNDER_REVIEW };

        store.setCodeForAction(codeForAction);
        setRowsChecked(rowsChecked.splice(selectedCodeToSubmit.id, 1));
    };

    const preparedOptions = React.useMemo(() =>
        prepareData(userStore.eligibleReviewers, {
            value: "userId",
            label: "userFullName",
        })
    );

    return (
        <>
            <Tooltip title={title}>
                <span>
                    <IconButton onClick={() => toggleDialogue()} disabled={!canShare} size="small">
                        <ShareIcon color={canShare ? "primary" : "disabled"} />
                    </IconButton>
                </span>
            </Tooltip>
            <Dialog
                open={displayDialogue}
                onClose={handleClose}
                aria-labelledby="request-for-review-dialog"
                aria-describedby="request-for-review-dialog"
                sx={{
                    "& .MuiDialog-container": {
                        "& .MuiPaper-root": {
                            width: "100%",
                            maxWidth: "700px",
                        },
                    },
                }}
            >
                <DialogTitle id="request-for-review-dialog">
                    Request a review for this code list
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Autocomplete
                        options={preparedOptions}
                        getOptionKey={option => (option ? option.value : "")}
                        getOptionLabel={option => (option ? option.label : "")}
                        value={selectedReviewer}
                        onChange={(e, newValue) => {
                            setSelectedReviewer(newValue || "");
                        }}
                        sx={{ marginTop: "16px", marginBottom: "8px", minWidth: 200 }}
                        disabled={userStore.eligibleReviewers?.length === 0}
                        renderInput={params => <TextField {...params} label="Reviewer" />}
                    />
                    <br />
                    {userStore.eligibleReviewers?.length === 0 && (
                        <Alert severity="error" sx={{ bgcolor: "background.paper" }}>
                            No eligible reviewers available. Please Connect with the Administrator.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <BasicButton
                        variant="outlined"
                        sx={{ m: 2 }}
                        handleClick={handleClose}
                        buttonText="Cancel"
                    />
                    <BasicButton
                        variant="contained"
                        sx={{ m: 2 }}
                        handleClick={() => handleSubmit()}
                        buttonText="Submit"
                        disabled={selectedReviewer === ""}
                    />
                </DialogActions>
            </Dialog>
        </>
    );
};
