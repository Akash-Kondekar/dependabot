import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import {
    Backdrop,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Paper,
    Typography,
} from "@mui/material";
import { formatDateTime } from "../../utils";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import studyProtocol from "../../state/store/studyProtocol.js";

const useStyles = makeStyles(theme => ({
    timelineContainer: {
        padding: theme.spacing(2),
        maxHeight: "70vh",
        overflowY: "auto",
    },
    timelineItem: {
        display: "flex",
        marginBottom: theme.spacing(3),
    },
    timelineIconContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginRight: theme.spacing(2),
    },
    timelineIcon: {
        padding: theme.spacing(1),
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    timelineConnector: {
        width: 2,
        backgroundColor: theme.palette.divider,
        flexGrow: 1,
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    timelineContent: {
        flex: 1,
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
    },
    timelineHeader: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: theme.spacing(1),
    },
    timelineUsername: {
        fontWeight: "bold",
    },
    timelineTimestamp: {
        color: theme.palette.text.secondary,
        fontSize: "0.875rem",
    },
    timelineAction: {
        display: "flex",
        alignItems: "center",
        marginBottom: theme.spacing(1),
    },
    timelineActionText: {
        marginLeft: theme.spacing(1),
        fontWeight: "medium",
    },
    timelineComments: {
        marginTop: theme.spacing(1),
        padding: theme.spacing(1),
        backgroundColor: theme.palette.action.hover,
        borderRadius: theme.shape.borderRadius,
        fontSize: "0.9rem",
    },
    createIcon: {
        backgroundColor: theme.palette.success.light,
        color: theme.palette.success.contrastText,
    },
    updateIcon: {
        backgroundColor: theme.palette.info.light,
        color: theme.palette.info.contrastText,
    },
    approveIcon: {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.success.contrastText,
    },
    rejectIcon: {
        backgroundColor: theme.palette.error.light,
        color: theme.palette.error.contrastText,
    },
    statusTransition: {
        backgroundColor: theme.palette.warning.light,
        padding: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
        marginTop: theme.spacing(1),
    },
    noData: {
        textAlign: "center",
        padding: theme.spacing(4),
    },
    loading: {
        display: "flex",
        justifyContent: "center",
        padding: theme.spacing(4),
    },
    dialogTitle: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
}));

const AuditLogTimeline = ({ projectId, jobId }) => {
    const classes = useStyles();
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
                    icon: <AddCircleIcon />,
                    className: classes.createIcon,
                    label: "Created",
                };
            case "UPDATE":
                return {
                    icon: <EditIcon />,
                    className: classes.updateIcon,
                    label: "Updated",
                };
            case "APPROVE":
                return {
                    icon: <CheckCircleIcon />,
                    className: classes.approveIcon,
                    label: "Approved",
                };
            case "REJECT":
                return {
                    icon: <DoDisturbIcon />,
                    className: classes.rejectIcon,
                    label: "Rejected",
                };
            case "CANCEL":
                return {
                    icon: <DoDisturbIcon />,
                    className: classes.rejectIcon,
                    label: "Cancelled",
                };
            case "DELETE":
                return {
                    icon: <DoDisturbIcon />,
                    className: classes.rejectIcon,
                    label: "Deleted",
                };
            default:
                return {
                    icon: <InfoIcon />,
                    className: classes.updateIcon,
                    label: action,
                };
        }
    };

    if (loading) {
        return (
            <Box className={classes.loading}>
                <CircularProgress />
            </Box>
        );
    }

    if (auditLogs.length === 0) {
        return (
            <Box className={classes.noData}>
                <Typography variant="body1">No audit logs available for this protocol.</Typography>
            </Box>
        );
    }

    return (
        <Box className={classes.timelineContainer}>
            {auditLogs &&
                auditLogs.map((log, index) => {
                    const { icon, className, label } = getIconForAction(log.action);
                    const isLastItem = index === auditLogs.length - 1;

                    return (
                        <Box key={log.id} className={classes.timelineItem}>
                            <Box className={classes.timelineIconContainer}>
                                <Box className={`${classes.timelineIcon} ${className}`}>{icon}</Box>
                                {!isLastItem && <Box className={classes.timelineConnector} />}
                            </Box>
                            <Paper elevation={1} className={classes.timelineContent}>
                                <Box className={classes.timelineHeader}>
                                    <Typography className={classes.timelineUsername}>
                                        {log.username}
                                    </Typography>
                                    <Typography className={classes.timelineTimestamp}>
                                        {formatDateTime(log.timestamp)}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box className={classes.timelineAction}>
                                    <Typography
                                        className={classes.timelineActionText}
                                        variant="subtitle1"
                                    >
                                        {label} {log.entityType.replace(/_/g, " ").toLowerCase()}
                                        {" for the study "}
                                        <Tooltip title={log.newState.jobId}>
                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                label={
                                                    log.newState.jobId
                                                        ? log.newState.jobId.substring(0, 8)
                                                        : log.newState.jobId
                                                }
                                            ></Chip>
                                        </Tooltip>
                                        {log.newState.protocolId && (
                                            <>
                                                {" linking the protocol "}
                                                <Tooltip title={log.newState.protocolId}>
                                                    <Chip
                                                        size="small"
                                                        variant="outlined"
                                                        label={
                                                            log.newState.protocolId
                                                                ? log.newState.protocolId.substring(
                                                                      0,
                                                                      8
                                                                  )
                                                                : log.newState.protocolId
                                                        }
                                                    ></Chip>
                                                </Tooltip>
                                            </>
                                        )}
                                    </Typography>
                                </Box>
                                {log.comments && (
                                    <Box className={classes.timelineComments}>
                                        <Typography variant="body2">{log.comments}</Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    );
                })}
        </Box>
    );
};

export const ManageProtocolDialog = observer(({ open, handleClose, studyData, projectId }) => {
    const classes = useStyles();

    return (
        <Dialog
            maxWidth="md"
            fullWidth={true}
            open={open}
            onClose={handleClose}
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
            <DialogTitle className={classes.dialogTitle}>
                <Typography variant="h6">Full database extraction request audit log</Typography>
                <IconButton aria-label="close" onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <AuditLogTimeline projectId={projectId} jobId={studyData.id} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
});
