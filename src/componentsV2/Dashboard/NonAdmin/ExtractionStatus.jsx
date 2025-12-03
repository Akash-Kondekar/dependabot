import React from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";

import dashboardStore from "../../../state/store/dashboard.js";
import { observer } from "mobx-react";
import { getUserFriendlyTime } from "../../../utils/index.jsx";

import jobStatus from "../../../state/store/study/job-status.js";

import { LinearProgress, Tooltip } from "@mui/material";

import WarningIcon from "@mui/icons-material/Warning";

import { HighlightOff, TaskAlt } from "@mui/icons-material";

import Box from "@mui/material/Box";

const outline = {
    borderRadius: "10px",
    overflow: "auto",
    padding: "10px",
};

const ExtractionStatus = observer(() => {
    if (
        dashboardStore.busy ||
        !dashboardStore.data?.latestStudies ||
        dashboardStore.data?.latestStudies?.length === 0
    ) {
        return;
    }

    return (
        <Box
            sx={{
                ...outline,
                bgcolor: "grey.background",
                mt: 2,
            }}
            aria-label="Extraction Service Status"
        >
            <Grid container justifyContent={"space-between"} margin={"10px"}>
                <Grid>
                    <Typography
                        component="span"
                        variant="h6"
                        color="textPrimary"
                        sx={{ fontWeight: 700 }}
                    >
                        Extraction Service Status
                    </Typography>
                </Grid>
                <Grid>
                    {<ExtractionServiceStatusIndicator isOn={jobStatus.isExtractionServiceOn} />}
                </Grid>
            </Grid>

            {jobStatus.isExtractionServiceOn ? (
                <>
                    <Grid container justifyContent={"space-between"} margin={"10px"}>
                        <Grid>
                            <Typography component="span" variant="h6" color="textPrimary">
                                Studies Awaiting Extraction
                            </Typography>
                        </Grid>
                        <Grid>
                            <Tooltip
                                title={
                                    "Total number of jobs: " + jobStatus.jobQueueStatus.totalJobs
                                }
                            >
                                <LinearProgress
                                    variant="determinate"
                                    value={jobStatus.jobQueueStatus.value}
                                    sx={{ width: 200, height: 25, borderRadius: 5 }}
                                    color={jobStatus.jobQueueStatus.color}
                                />
                            </Tooltip>
                        </Grid>
                    </Grid>
                    <Grid container justifyContent={"flex-end"} sx={{ mt: 3 }}>
                        <Typography variant="body2" style={{ margin: "10px" }}>
                            Last updated on:{" "}
                            {getUserFriendlyTime(jobStatus.jobQueueStatus.lastUpdated)}
                        </Typography>
                    </Grid>
                </>
            ) : (
                <Stack
                    direction="row"
                    spacing={1}
                    margin={"10px"}
                    alignItems="center"
                    sx={{ pt: 2 }}
                >
                    <WarningIcon color="warning" />
                    <Typography component="span" variant="body">
                        The extraction service is currently unavailable. Status updates for studies
                        cannot be provided at this time
                    </Typography>
                </Stack>
            )}
        </Box>
    );
});

const ExtractionServiceStatusIndicator = props => {
    return props?.isOn ? (
        <Stack direction="row" spacing={1} alignItems="center">
            <TaskAlt fontSize="large" color="success" />
            <Typography component="span" variant="h6" color="success">
                ON
            </Typography>
        </Stack>
    ) : (
        <Stack direction="row" spacing={1} alignItems="center">
            <HighlightOff fontSize="medium" color="error" sx={{ verticalAlign: "middle" }} />
            <Typography component="span" variant="h6" color="error">
                OFF
            </Typography>
        </Stack>
    );
};

const ExtractionService = observer(() => {
    React.useEffect(() => {
        (async () => {
            await jobStatus.getExtractionServiceStatus();
        })();
    }, []);

    return (
        <div>
            <ExtractionStatus />
        </div>
    );
});

export default ExtractionService;
