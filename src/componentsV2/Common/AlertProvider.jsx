import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Backdrop from "@mui/material/Backdrop";
import Grow from "@mui/material/Grow";
import Slide from "@mui/material/Slide";
import { Box, Typography } from "@mui/material";
import ExclaimIcon from "@mui/icons-material/ErrorOutlineRounded";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import HelpIcon from "@mui/icons-material/Help";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { BasicButton } from "./BasicButton";
import { useTheme } from "@mui/material/styles";
import { NOTIFICATION_TYPE } from "../../constants";

let externalShowAlert;

// MUI transitions
const SlideTransition = props => <Slide {...props} direction="left" />;
const GrowTransition = React.forwardRef(function GrowTransition(props, ref) {
    return <Grow {...props} ref={ref} />;
});

export const getIconByType = (theme, type, size = "toast") => {
    const fontSize = size === "toast" ? "h1" : theme.spacing(8);
    switch (type) {
        case NOTIFICATION_TYPE.WARNING:
            return <ExclaimIcon color="warning" sx={{ fontSize: { fontSize } }} />;
        case NOTIFICATION_TYPE.ERROR:
            return <HighlightOffOutlinedIcon color="error" sx={{ fontSize: { fontSize } }} />;
        case NOTIFICATION_TYPE.INFO:
            return <HelpIcon color="info" sx={{ fontSize: { fontSize } }} />;
        case NOTIFICATION_TYPE.SUCCESS:
            return <CheckCircleIcon color="success" sx={{ fontSize: { fontSize } }} />;
        default:
            return null;
    }
};

// Toast component
const Toast = ({ toast, handleToastClose, offset }) => {
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const progressColor = theme.palette[toast.type]?.main || theme.palette.primary.main;

    // Progress update
    const interval = 100;
    const step = useMemo(() => (interval / (toast.autoClose || 3000)) * 100, [toast.autoClose]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (!isPaused) {
                setProgress(prev => Math.max(prev - step, 0));
            }
        }, interval);
        return () => clearInterval(timer);
    }, [isPaused, step]);

    // Close toast when progress reaches 0
    useEffect(() => {
        if (progress <= 0) handleToastClose(toast.id);
    }, [progress, toast.id, handleToastClose]);

    return (
        <Snackbar
            key={toast.id}
            open
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            slots={{ transition: SlideTransition }}
            sx={{ mb: 1, top: `${offset + 16}px !important` }}
        >
            <Alert
                severity={toast.type}
                onClose={() => handleToastClose(toast.id)}
                icon={
                    toast.icon ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {getIconByType(theme, toast.type, "toast")}
                        </Box>
                    ) : undefined
                }
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                sx={{
                    minWidth: "320px",
                    maxWidth: "430px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    position: "relative",
                    padding: "14px 18px 10px 18px",
                    borderRadius: 2,
                    boxShadow: 3,
                    fontSize: "1rem",
                    "& .MuiAlert-icon": {
                        display: "flex",
                        alignItems: "center",
                        mt: 0,
                    },
                    ...(isDarkMode && {
                        backgroundColor: theme.palette.grey.dark,
                    }),
                }}
            >
                {/* Text wrapper */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                    >
                        {toast.title}
                    </Typography>
                    {toast.text && (
                        <Typography
                            variant="body2"
                            sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                        >
                            {toast.text}
                        </Typography>
                    )}
                </Box>

                <Box
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        height: "4px",
                        width: "100%",
                        backgroundColor: "transparent",
                    }}
                >
                    <Box
                        sx={{
                            height: "100%",
                            backgroundColor: progressColor || "primary.main",
                            width: `${progress}%`,
                            transition: "width 100ms linear",
                        }}
                    />
                </Box>
            </Alert>
        </Snackbar>
    );
};

export const AlertProvider = ({ children }) => {
    // Toasts queue
    const [toasts, setToasts] = useState([]);
    // Confirm dialog state
    const [confirm, setConfirm] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const resolverRef = useRef(null);
    const theme = useTheme();

    const MAX_TOASTS = 2;

    const showAlert = useCallback(options => {
        // Blur any active input to prevent focus issues
        if (document?.activeElement) {
            document?.activeElement?.blur();
        }

        if (options.type === NOTIFICATION_TYPE.CONFIRM) {
            setConfirm(options);
            setConfirmOpen(true);
            if (options.resolve) {
                resolverRef.current = options.resolve;
            }
        } else {
            const id = Date.now();
            setToasts(prev => {
                // prevent duplicates and only remove oldest toast when exceeding limit
                const isDuplicate = prev.some(
                    t =>
                        t.id === id ||
                        (t.type === options.type &&
                            t.title === options.title &&
                            t.text === options.text)
                );
                if (isDuplicate) return prev;
                const updated = [...prev, { ...options, id }];
                return updated.length > MAX_TOASTS ? updated.slice(1) : updated;
            });
        }
    }, []);

    const handleToastClose = id => setToasts(prev => prev.filter(t => t.id !== id));

    const handleConfirmClose = () => {
        setConfirmOpen(false);
        setTimeout(() => setConfirm(null), 200);
        resolverRef.current = null;
    };

    const handleConfirmBtnClick = (clickedYes = false) => {
        if (resolverRef.current) resolverRef.current({ isConfirmed: clickedYes });
        handleConfirmClose();
    };

    useEffect(() => {
        externalShowAlert = showAlert;
    }, [showAlert]);

    return (
        <>
            {children}

            {/* Toasts */}
            {toasts.map((toast, index) => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    handleToastClose={handleToastClose}
                    offset={index * 80}
                />
            ))}

            {/* Confirm Dialog */}
            {confirm && (
                <>
                    {/* Blurred and dimmed backdrop */}
                    {/* TODO: Make it generic component while working on DXT-338 */}
                    <Backdrop
                        open={confirmOpen}
                        sx={{
                            zIndex: 1200,
                            backdropFilter: "blur(2px)",
                            backgroundColor: "rgba(0,0,0,0.4)",
                        }}
                    />

                    <Dialog
                        open={confirmOpen}
                        onClose={() => handleConfirmBtnClick(false)}
                        maxWidth="xs"
                        fullWidth
                        slots={{ transition: GrowTransition }}
                        keepMounted
                        slotProps={{
                            paper: {
                                sx: {
                                    borderRadius: 2,
                                    boxShadow: 24,
                                    textAlign: "center",
                                },
                            },
                        }}
                    >
                        <DialogTitle sx={{ textAlign: "center", pt: 3, pb: 2, px: 2 }}>
                            <Box>
                                {confirm.icon && getIconByType(theme, "warning", "dialog")}
                                <Typography fontWeight="bold" variant="h5" component="h2">
                                    {confirm.title || "Are you sure?"}
                                </Typography>
                            </Box>
                        </DialogTitle>

                        <DialogContent sx={{ textAlign: "center", px: 2 }}>
                            <Typography color="text.secondary" variant="h6" component="p">
                                {confirm.text || "Do you want to continue?"}
                            </Typography>
                        </DialogContent>

                        {/* Action buttons */}
                        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3, px: 2 }}>
                            <BasicButton
                                variant="outlined"
                                onClick={() => handleConfirmBtnClick(false)}
                                sx={{
                                    flex: 1,
                                    maxWidth: 120,
                                }}
                                buttonText="Cancel"
                            />
                            <BasicButton
                                variant="contained"
                                onClick={() => handleConfirmBtnClick(true)}
                                sx={{
                                    flex: 1,
                                    maxWidth: 120,
                                }}
                                buttonText="Yes"
                            />
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </>
    );
};

export const getAlert = () => {
    if (!externalShowAlert) throw new Error("AlertProvider is not mounted");
    return externalShowAlert;
};
