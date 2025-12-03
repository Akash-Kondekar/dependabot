import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Box, Chip, CircularProgress, Divider, Typography } from "@mui/material";
import { formatDateTime, getUserFriendlyTime } from "../../utils";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import studyProtocol from "../../state/store/studyProtocol.js";
import { DialogBox } from "../Common/DialogBox.jsx";
import {
    AccessTime,
    CheckCircleOutlined,
    DoneAllOutlined,
    DoneOutlined,
    EditOutlined,
    PlayCircleOutlined,
} from "@mui/icons-material";
import Grid from "@mui/material/Grid2";

const styles = {
    timelineItem: { display: "flex", m: 1, mt: 2 },
    timelineIconContainer: {
        mt: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mr: 1,
    },
    timelineIcon: {
        p: 1,
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    timelineConnector: {
        width: 2,
        backgroundColor: "divider",
        flexGrow: 1,
        mt: 0,
        mb: -15,
    },
    timelineContent: {
        flex: 1,
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
    },
    timelineHeader: { display: "flex", justifyContent: "space-between", mb: 1 },
    timelineComments: { mt: 1, p: 1, bgcolor: "action.hover", borderRadius: 1 },
};

// Helper function to calculate duration between two timestamps
const calculateDuration = (startTimestamp, endTimestamp) => {
    const start = new Date(startTimestamp);
    const end = new Date(endTimestamp);
    const diffMs = end - start;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}y ${days % 365}d`;
    if (months > 0) return `${months}mo ${days % 30}d`;
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    if (seconds <= 0) return `less than a second`;
    return `${seconds}s`;
};

const AuditLogTimeline = ({ projectId, jobId }) => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getAuditData = async () => {
            const sortedLogs = studyProtocol.fetchAuditLogs(projectId, jobId);
            setAuditLogs(await sortedLogs);
        };
        if (projectId && jobId) {
            setLoading(true);
            getAuditData();
            setLoading(false);
        }
    }, [projectId, jobId]);

    const getIconForAction = action => {
        switch (action) {
            case "CREATE":
                return {
                    icon: <DoneOutlined color="info" />,
                    label: "Created",
                };
            case "UPDATE":
                return {
                    icon: <EditOutlined color="info" />,
                    label: "Updated",
                };
            case "APPROVE":
                return {
                    icon: <CheckCircleOutlined color="success" />,
                    label: "Approved",
                };
            case "REJECT":
                return {
                    icon: <DoDisturbIcon color="error" />,
                    label: "Rejected",
                };
            case "CANCEL":
                return {
                    icon: <DoDisturbIcon color="error" />,
                    label: "Cancelled",
                };
            case "DELETE":
                return {
                    icon: <DoDisturbIcon color="error" />,
                    label: "Deleted",
                };
            case "ATTACH":
                return {
                    icon: <PlayCircleOutlined color="info" />,
                    label: "Started",
                };
            case "DETACH":
                return {
                    icon: <DoneAllOutlined color="success" />,
                    label: "Completed",
                };
            default:
                return {
                    icon: <InfoIcon color="info" />,
                    label: action,
                };
        }
    };

    if (loading) {
        return (
            <Box>
                <CircularProgress />
            </Box>
        );
    }

    if (auditLogs.length === 0) {
        return (
            <Box>
                <Typography variant="body1">No audit logs available for this protocol.</Typography>
            </Box>
        );
    }

    return (
        <Grid container justifyContent="center" spacing={1}>
            {auditLogs &&
                auditLogs.map((log, index) => {
                    const { icon, sx: actionSx, label } = getIconForAction(log.action);
                    const isLastItem = index === auditLogs.length - 1;
                    const nextLog = !isLastItem ? auditLogs[index + 1] : null;
                    const duration = nextLog
                        ? calculateDuration(nextLog.timestamp, log.timestamp)
                        : null;

                    return (
                        <>
                            <Grid key={log.id} size={12}>
                                <Box key={log.id} sx={styles.timelineItem}>
                                    <Box sx={styles.timelineIconContainer}>
                                        <Box sx={[styles.timelineIcon, actionSx]}>{icon}</Box>
                                        {!isLastItem && <Box sx={styles.timelineConnector}></Box>}
                                    </Box>
                                    <Box sx={styles.timelineContent}>
                                        <Box sx={styles.timelineHeader}>
                                            <Typography variant="h6">{log.username}</Typography>
                                            <Tooltip title={formatDateTime(log.timestamp)}>
                                                <Typography variant="subtitle2">
                                                    {getUserFriendlyTime(log.timestamp)}
                                                </Typography>
                                            </Tooltip>
                                        </Box>
                                        <Divider />
                                        <Box>
                                            <Typography variant="subtitle1">
                                                {label === "ATTACH"
                                                    ? "Started"
                                                    : label === "DETACH"
                                                      ? "Completed"
                                                      : label}{" "}
                                                {log.entityType.replace(/_/g, " ").toLowerCase()}
                                                {" for the study "}
                                                <Tooltip title={log.newState?.jobId}>
                                                    <Chip
                                                        size="small"
                                                        variant="outlined"
                                                        label={
                                                            log.newState?.jobId
                                                                ? log.newState?.jobId?.substring(
                                                                      0,
                                                                      8
                                                                  )
                                                                : log.newState?.jobId
                                                        }
                                                    ></Chip>
                                                </Tooltip>
                                                {log.newState?.protocolId && (
                                                    <>
                                                        {" linking the protocol "}
                                                        <Tooltip title={log.newState?.protocolId}>
                                                            <Chip
                                                                size="small"
                                                                variant="outlined"
                                                                label={
                                                                    log.newState?.protocolId
                                                                        ? log.newState?.protocolId?.substring(
                                                                              0,
                                                                              8
                                                                          )
                                                                        : log.newState?.protocolId
                                                                }
                                                            ></Chip>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </Typography>
                                        </Box>
                                        {log.comments && (
                                            <Box sx={styles.timelineComments}>
                                                <Typography variant="body2">
                                                    {log.comments}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                            {duration && (
                                <Grid>
                                    <Tooltip title={`Processing time: ${duration}`}>
                                        <Chip
                                            icon={<AccessTime />}
                                            variant="outlined"
                                            label={duration}
                                        />
                                    </Tooltip>
                                </Grid>
                            )}
                        </>
                    );
                })}
        </Grid>
    );
};

export const StudyTimeline = observer(({ open, handleClose, studyData, projectId }) => {
    return (
        <DialogBox
            open={open}
            handleClose={handleClose}
            title="Full database extraction request audit log"
            Content={
                <>
                    <AuditLogTimeline projectId={projectId} jobId={studyData.id} />
                </>
            }
            maxWidth="md"
            fullWidth={true}
            closeAfterTransition
        />
    );
});
