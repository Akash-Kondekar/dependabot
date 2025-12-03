import React from "react";
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { BasicButton, Dropdown, Input, ShowSuccess } from "../Common";
import FeedbackStore from "../../state/store/feedback";
import { observer } from "mobx-react";
import CloseIcon from "@mui/icons-material/Close";
import CampaignIcon from "@mui/icons-material/Campaign";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { ShowWarning } from "../../componentsV2/Common/Toast";

const Feedback = observer(() => {
    const [open, setOpen] = React.useState(false);
    const [subject, setSubject] = React.useState("");
    const [description, setDescription] = React.useState("");
    const CHARACTER_LIMIT = 500;

    const options = [
        {
            label: "Report a bug",
            value: "bug",
        },
        {
            label: "Ask a question",
            value: "question",
        },
        {
            label: "Leave a feedback",
            value: "feedback",
        },
    ];

    const handleFeedback = async () => {
        if (subject === "" || subject === undefined) {
            return ShowWarning("Please select a valid subject");
        }

        if (description === "" || description === undefined) {
            return ShowWarning("Please provide a description to continue");
        }

        const payload = {
            subject: subject,
            description: description,
        };

        const success = await FeedbackStore.save(payload);

        if (success) {
            ShowSuccess(
                "Thank you!",
                "Your valuable feedback helps us continually improve our service.",
                500
            );
        }

        handleCancel();
    };

    const handleCancel = () => {
        setSubject("");
        setDescription("");
        setOpen(false);
    };

    return (
        <div>
            <Tooltip placement="bottom" title="Feedback">
                <IconButton
                    aria-label="feedback-icon"
                    size="large"
                    onClick={() => setOpen(true)}
                    color="inherit"
                >
                    <CampaignIcon />
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={handleCancel}>
                <DialogTitle
                    id="alert-dialog-title"
                    sx={{
                        backgroundColor: theme => theme.palette.primary.main,
                        color: theme => theme.palette.primary.contrastText,
                    }}
                >
                    <Typography id="Feedback-Header" variant="h5" component="h2">
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span> Feedback</span>
                            <IconButton
                                aria-label="close"
                                size="small"
                                sx={{ color: theme => theme.palette.primary.contrastText }}
                                onClick={() => handleCancel()}
                            >
                                <CloseIcon />
                            </IconButton>
                        </div>
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ ".MuiDialogContent-root": { padding: "0px" } }}>
                    <DialogContentText>
                        <Typography
                            id="Feedback-info-card"
                            sx={{ padding: "30px 20px 30px 25px" }}
                            component="div"
                        >
                            <div>
                                <Typography
                                    id="Feedback-actionable-section"
                                    variant="h5"
                                    component="h1"
                                    sx={{ fontWeight: "500", textAlign: "center" }}
                                >
                                    We value your feedback
                                </Typography>
                            </div>
                            <div>
                                <p style={{ fontSize: "16px", textAlign: "center" }}>
                                    We value your opinion and strive to improve our services based
                                    on your suggestions. Please fill out the following form
                                </p>
                            </div>
                            <Dropdown
                                ddLabel=""
                                labelName="feedback"
                                labelValue={subject === "" ? "I want to..." : ""}
                                value={subject ?? ""}
                                handleChange={e => {
                                    setSubject(e.target.value);
                                }}
                                dropdownOptions={options}
                                styles={{ transform: "translate(14px, 9px) scale(1) !important" }}
                            />

                            {subject !== "" && (
                                <div>
                                    <Input
                                        label="Description"
                                        multiline={true}
                                        rows={4}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        inputProps={{ maxLength: CHARACTER_LIMIT }}
                                    />
                                    <div style={{ textAlign: "right" }}>
                                        {description.length}/{CHARACTER_LIMIT}
                                    </div>
                                </div>
                            )}

                            <Stack
                                direction="row"
                                spacing={2}
                                justifyContent="flex-end"
                                sx={{ mt: 2 }}
                            >
                                <BasicButton
                                    buttonText="Cancel"
                                    variant="outlined"
                                    handleClick={() => handleCancel()}
                                />
                                <BasicButton
                                    buttonText="Send"
                                    handleClick={() => handleFeedback()}
                                    disabled={description.trim() === ""}
                                />
                            </Stack>
                        </Typography>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </div>
    );
});

export default Feedback;
