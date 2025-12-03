import React, { useState } from "react";
import { Box, Typography, IconButton, Collapse, useTheme } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const WarningBox = ({ headerText, children, sx, backgroundColor }) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);

    const handleToggle = () => setExpanded(!expanded);

    return (
        <Box
            sx={{
                border: `1px solid ${theme.palette.warning.main}`,
                backgroundColor,
                borderRadius: 2,
                px: 2,
                py: 1.5,
                ...sx,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WarningAmberIcon sx={{ color: theme.palette.warning.main }} />
                <Typography
                    variant="body2"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 600,
                    }}
                >
                    {headerText}
                </Typography>
                <IconButton
                    aria-label={expanded ? "Collapse" : "Expand"}
                    onClick={handleToggle}
                    size="small"
                    sx={{
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s",
                    }}
                >
                    <ExpandMoreIcon />
                </IconButton>
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ mt: 1 }}>{children}</Box>
            </Collapse>
        </Box>
    );
};

export default WarningBox;
