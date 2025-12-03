import React from "react";
import Typography from "@mui/material/Typography";
import { observer } from "mobx-react";
import broadcastStore from "../../state/store/admin/broadcast.js";
import { formatDate } from "../../utils/index.jsx";
import Stack from "@mui/material/Stack";
import WarningIcon from "@mui/icons-material/WarningAmber";
import { NoData } from "../../components/Common/NoData.jsx";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import events from "../../lib/events.js";
import jobStatus from "../../state/store/study/job-status.js";
import Alert from "@mui/material/Alert";
import session from "../../state/store/session.js";
import { useTheme } from "@mui/material/styles";

const severityName = { 1: "High", 2: "Medium", 3: "Low" };

const Severity = observer(({ severity, setColor }) => {
    return (
        <Stack direction="row" alignItems="center" gap={0} display="inline-flex">
            <Chip
                label={
                    <Typography fontSize="small" fontWeight="bold">
                        {severity}
                    </Typography>
                }
                sx={{
                    width: "80px",
                    borderWidth: "1.5px",
                    mr: 2,
                    color: setColor[severity].color,
                    border: `1.5px solid ${setColor[severity].color}`,
                }}
                variant="outlined"
                color={setColor[severity].color}
                size="small"
            />
        </Stack>
    );
});
const DisplayMessages = observer(() => {
    const theme = useTheme();

    const maxHeight = "60vh";
    const setColor = {
        High: {
            color: theme.palette.high.color,
            bgColor: theme.palette.high.bgColor,
        },
        Medium: {
            color: theme.palette.medium.color,
            bgColor: theme.palette.medium.bgColor,
        },
        Low: {
            color: theme.palette.low.color,
            bgColor: theme.palette.low.bgColor,
        },
    };

    if (!broadcastStore.messages || broadcastStore.messages?.length === 0) {
        return;
    }

    return (
        <Box
            sx={{
                maxHeight: maxHeight,
                backgroundColor: theme => theme.palette.grey.background,
                overflowY: "auto",
                padding: 2,
                borderRadius: "16px",
                margin: "2%",
            }}
        >
            <Typography
                variant="h6"
                color="textPrimary"
                sx={{ margin: "5px 10px", fontWeight: "700" }}
            >
                <WarningIcon sx={{ verticalAlign: "text-bottom" }} color="warning" /> Notice
            </Typography>
            <Box>
                {broadcastStore.messages?.length === 0 ? (
                    <NoData message="You do not have any notifications" />
                ) : (
                    <>
                        {broadcastStore.messages
                            .slice()
                            .sort((a, b) => {
                                return a.severity === b.severity
                                    ? Date.parse(b.createdOn) - Date.parse(a.createdOn)
                                    : a.severity - b.severity;
                            })
                            .map((message, index) => {
                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 2,
                                            backgroundColor:
                                                setColor[severityName[message.severity]].bgColor,
                                            marginBottom: "10px",
                                            marginX: "10px",

                                            border: "none",
                                            borderRadius: "8px",
                                            fontWeight: 700,
                                        }}
                                    >
                                        <Grid
                                            container
                                            sx={{ mb: 2 }}
                                            alignItems="space-evenly"
                                            spacing={1}
                                        >
                                            <Grid size={11}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        overflowWrap: "anywhere",
                                                        alignItems: "flex-start",
                                                    }}
                                                >
                                                    <Severity
                                                        severity={severityName[message.severity]}
                                                        setColor={setColor}
                                                    />
                                                    {message.messageSummary}
                                                </div>
                                            </Grid>
                                            <Grid size={1} sx={{ textAlign: "right" }}>
                                                <Typography variant="caption">
                                                    {formatDate(message.createdOn)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="textPrimary"
                                            sx={{ overflowWrap: "break-word" }}
                                        >
                                            {message.messageDetails}
                                        </Typography>
                                    </Box>
                                );
                            })}
                    </>
                )}
            </Box>
        </Box>
    );
});

const JobDisabled = observer(() => {
    const [show, setShow] = React.useState(false);

    const hideMessage = () => setShow(false);
    const showMessage = () => setShow(true);
    const theme = useTheme();

    React.useEffect(() => {
        events.on("job.enable", hideMessage);
        events.on("job.disable", showMessage);
    }, []);

    React.useEffect(() => {
        (async () => {
            await jobStatus.checkStatus();
            if (jobStatus.status !== "true") {
                setShow(true);
            }
        })();
    }, []);

    return (
        show && (
            <Alert
                severity="warning"
                color="warning"
                sx={{
                    margin: "2% 2% 0 2%",
                    backgroundColor: theme.palette.customWarning.main,
                }}
            >
                Study Submissions are currently disabled by Admin. Please try later.
            </Alert>
        )
    );
});

export const CommonDashboard = observer(() => {
    React.useEffect(() => {
        (async () => {
            await broadcastStore.load();
            await jobStatus.getJobQueueStatus();
        })();
    }, []);

    //Since we are not building dashoard for admins. We are only going to show coming soon message and hence this section will be temporarily hidden
    if (session.isAdmin) {
        return;
    }

    return (
        <div>
            <JobDisabled />
            <DisplayMessages />
        </div>
    );
});
