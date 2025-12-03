import React from "react";
import { Copy } from ".";
import { observer } from "mobx-react";
import { Stack, Tooltip, Typography } from "@mui/material";

export const CopyableContent = observer(
    ({ content, copyContent, showCopyIconFn, tooltipLabel, copyTooltipLabel }) => (
        <div style={{ minWidth: 110 }}>
            <Typography component="span">
                <Stack direction="row" spacing={1}>
                    <Tooltip title={tooltipLabel} placement="top-start">
                        {content}
                    </Tooltip>

                    {typeof showCopyIconFn === "function" && showCopyIconFn() && (
                        <Tooltip title={copyTooltipLabel}>
                            <span>
                                <Copy icon text={copyContent} />
                            </span>
                        </Tooltip>
                    )}
                </Stack>
            </Typography>
        </div>
    )
);
