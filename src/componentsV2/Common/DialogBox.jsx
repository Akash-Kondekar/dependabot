import React from "react";

import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@emotion/react";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Backdrop } from "@mui/material";

export const DialogBox = ({
    open,
    handleClose,
    title,
    Content,
    showHeaderCloseBtn = true,
    ...props
}) => {
    const systemTheme = useTheme();
    const isDarkMode = systemTheme.palette.mode === "dark";

    const titleId = React.useId();
    const contentId = React.useId();

    return (
        <Dialog
            open={open}
            closeAfterTransition={false}
            onClose={handleClose}
            aria-labelledby={titleId}
            aria-describedby={contentId}
            {...props}
            slots={{
                backdrop: Backdrop,
            }}
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 6,
                        border: theme =>
                            `1px solid ${isDarkMode ? theme.palette.grey.light : theme.palette.grey.main}`,
                    },
                    backdrop: {
                        timeout: 500,
                    },
                },
            }}
        >
            <DialogTitle
                id={titleId}
                sx={{
                    bgcolor: isDarkMode ? "grey.main" : "primary.light",
                    height: "55px",
                    padding: "10px 20px",
                }}
            >
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                >
                    <Typography
                        component="div"
                        variant="h6"
                        sx={{
                            borderRadius: "10px 10px 0px 0px",
                            fontWeight: 600,
                        }}
                    >
                        {title}
                    </Typography>
                    {showHeaderCloseBtn && (
                        <IconButton
                            aria-label="Close Dialog Box"
                            size="small"
                            onClick={handleClose}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </Stack>
            </DialogTitle>
            <DialogContent id={contentId}>{Content}</DialogContent>
        </Dialog>
    );
};
