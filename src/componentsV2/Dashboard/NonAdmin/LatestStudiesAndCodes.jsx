import React from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";

import { useTheme } from "@mui/material/styles";

import dashboardStore from "../../../state/store/dashboard.js";
import user from "../../../state/store/user.js";
import { observer } from "mobx-react";
import {
    GetIconForThisStatus,
    JOB_STATUS,
    radioOptionsDatabaseTypes,
} from "../../../constants/index.jsx";
import session from "../../../state/store/session.js";

import { IconButton, Tooltip } from "@mui/material";

import projectDetails from "../../../state/store/projects/details.js";
import projectDetailsStore from "../../../state/store/projects/details.js";

import { BasicActionableCard } from "../../Common/BasicActionableCard.jsx";
import Box from "@mui/material/Box";

import RefreshIcon from "@mui/icons-material/Refresh";
import medicalStore from "../../../state/store/codebuilder/medical.js";
import drugStore from "../../../state/store/codebuilder/drugs.js";
import CancelOutlinedIcon from "@mui/icons-material/DoDisturb";
import { useNavigate } from "react-router-dom";
import { getUserFriendlyTime } from "../../../utils/index.jsx";
import InfoIcon from "@mui/icons-material/Info";

import Chip from "@mui/material/Chip";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import BasicCarousel from "../../Common/BasicCarousel.jsx";
import { SchemaOutlined, VisibilityOutlined } from "@mui/icons-material";
import { ShowDataExtractionSummary, ShowResults } from "../../MyProjects/ProjectStudiesTable.jsx";
import { Confirm } from "../../Common/Confirm.jsx";
import { ShowSuccess } from "../../Common/Toast.jsx";

const LatestStudies = observer(() => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    if (
        dashboardStore.busy ||
        !dashboardStore.data?.latestStudies ||
        dashboardStore.data?.latestStudies.length === 0
    ) {
        return null;
    }

    const getDatacoveragelabel = coverage => {
        const target = radioOptionsDatabaseTypes.findIndex(type => type.value === coverage);
        return radioOptionsDatabaseTypes[target]?.label;
    };

    const Actions = observer(({ study }) => {
        const { isActiveClient } = user;

        const isAdmin = session.isAdmin;

        const readOnly = projectDetails.currentUserProjectRole <= 1;

        const isJob = study.jobName.startsWith("AVF") === false;
        const isJobCompleted = study?.status === JOB_STATUS.COMPLETED;
        const isJobCancelled = study?.status === JOB_STATUS.CANCELLED;
        const isJobArchived = study?.status === JOB_STATUS.ARCHIVED;

        const [rowSelected, setRowSelected] = React.useState(null);
        const [results, setResults] = React.useState(false);
        const [extractSummary, setExtractSummary] = React.useState(false);
        const disableCancelIcon =
            (!isAdmin && readOnly) || isJobCancelled || isJobCompleted || isJobArchived;

        return (
            <Stack direction="row" sx={{ paddingBottom: "10px" }} spacing={1} aria-label="Actions">
                <Tooltip title="View Study Design" aria-label="View Study Design">
                    <span>
                        <IconButton
                            aria-label="View Study Design"
                            disabled={study?.status === JOB_STATUS.ARCHIVED}
                            onClick={async () => {
                                setRowSelected(study);
                                setResults(true);
                            }}
                        >
                            <VisibilityOutlined />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title="Coming Soon">
                    <span>
                        <IconButton disabled={true} aria-label="Reload study">
                            <RefreshIcon />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip
                    title="View Data Extraction Summary"
                    aria-label="View Data Extraction Summary"
                >
                    <span>
                        <IconButton
                            aria-label="View Data Extraction Summary"
                            disabled={study?.status !== JOB_STATUS.COMPLETED}
                            onClick={async () => {
                                setRowSelected(study);
                                setExtractSummary(true);
                            }}
                        >
                            <SchemaOutlined />
                        </IconButton>
                    </span>
                </Tooltip>

                {disableCancelIcon === false && (
                    <IconButton
                        disabled={disableCancelIcon || !isActiveClient}
                        aria-label="Cancel"
                        sx={{ opacity: disableCancelIcon || !isActiveClient ? 0.5 : 1 }}
                        onClick={async () => {
                            const { isConfirmed } = await Confirm(
                                "Cancel",
                                "Are you sure you want to Cancel"
                            );
                            if (isConfirmed) {
                                if (isJob) {
                                    // Then it is a Job
                                    await projectDetails.cancelJob(study?.projectID, study?.jobID);
                                    dashboardStore.updateData(study?.jobID, JOB_STATUS.CANCELLED);
                                    ShowSuccess("Cancelled");
                                } else {
                                    // Then it is an AddOn
                                    await projectDetails.cancelAddOn(
                                        study?.projectID,
                                        study?.jobID
                                    );
                                    dashboardStore.updateData(study?.jobID, JOB_STATUS.CANCELLED);
                                    ShowSuccess("Cancelled");
                                }
                            }
                        }}
                    >
                        <CancelOutlinedIcon color="error" />
                    </IconButton>
                )}

                <Tooltip title="Coming Soon">
                    <span>
                        <IconButton disabled={true} aria-label="More actions">
                            <MoreHorizRoundedIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                {results && (
                    <ShowResults
                        data={rowSelected}
                        setMode={study.setMode}
                        handleClickOpen={study.handleClickOpen}
                        handleClose={setResults}
                        open={results}
                        rowSelected={rowSelected}
                        type={study.type}
                    />
                )}
                {extractSummary && (
                    <ShowDataExtractionSummary
                        data={rowSelected}
                        setMode={study.setMode}
                        handleClickOpen={study.handleClickOpen}
                        handleClose={setExtractSummary}
                        open={extractSummary}
                        rowSelected={rowSelected}
                        type={study.type}
                    />
                )}
            </Stack>
        );
    });

    const ContentForStudy = study => {
        const labelStyle = {
            padding: "10px 0px",
            verticalAlign: "middle",
        };
        return (
            <Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        pb: "15px",
                    }}
                >
                    {study.jobName}
                </Typography>
                <Box>
                    <Typography variant="body1" sx={{ ...labelStyle }}>
                        <b>Study Design:</b> {study.studyDesign}
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="body1" sx={{ ...labelStyle }}>
                        <b>Data Coverage: </b> {getDatacoveragelabel(study.dataCoverage)}
                    </Typography>
                </Box>
                <Box
                    style={{
                        ...labelStyle,
                        display: "flex",
                        alignItems: "center",
                        columnGap: "20px",
                    }}
                >
                    <GetIconForThisStatus desc={study.statusDescription} />

                    <Chip
                        key={study.dbName}
                        label={study.dbName}
                        color={theme.palette.primary.light}
                        sx={{
                            fontSize: "12px",
                            bgcolor: theme.palette.primary.light,
                            margin: "2px",
                            fontWeight: 700,
                            color: "grey.900",
                        }}
                        size="small"
                    />
                </Box>
            </Box>
        );
    };

    return (
        <>
            {dashboardStore.data?.latestStudies?.map(study => {
                const key = study.jobID + study.jobName + study.submittedOn;
                return (
                    <Box key={key} aria-label={key} sx={{ mr: 1, mb: 1 }}>
                        <BasicActionableCard
                            handleOnClick={async () => {
                                const project = {
                                    projectID: study.projectID,
                                    projectName: study.projectName,
                                };
                                projectDetailsStore.setProject(project);
                                navigate("/projects/details/new", {
                                    state: {
                                        highlightJobId: study.id,
                                    },
                                });
                            }}
                            cardContent={ContentForStudy(study)}
                            cardActions={true}
                            actions={<Actions study={study} />}
                            style={{
                                minHeight: "200px",
                                bgcolor: isDarkMode && theme.palette.grey.light,
                                height: 270,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        />
                    </Box>
                );
            })}
        </>
    );
});

const LatestCodes = observer(({ codes, store, type }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const refForTag = React.useRef(null);

    if (dashboardStore.busy || !codes || codes?.length === 0) {
        return;
    }

    const label = {
        fontSize: "12px",
        fontWeight: 700,
        margin: "10px 0px",
    };

    const viewCode = code => {
        const codeToView = {
            id: code.Id,
            name: code.name,
            owner: code.owner,
            ownerName: code.ownerName,
            createdOn: code.createdOn,
            modifiedOn: code.modifiedOn,
            modifiedBy: code.modifiedBy,
            dbNames: code.dbNames,
            tags: code.tags,
            status: code.status,
            reviewer: code.reviewer,
            approvedBy: code.approvedBy,
            approvedOn: code.approvedOn,
        };

        store.setMasterCodeListForView([]); // Reset existing values;
        store.setRichTextContentInLibrary(""); // Reset existing values;
        store.setCodeDetailsToView(codeToView);

        navigate(`/builder/library/${type}/view`, { state: { title: "Library" } });
    };

    const CREATED_DATE = ({ code }) => {
        return (
            <>
                <Typography variant="body1">
                    <b>Created: </b>
                    {getUserFriendlyTime(code.createdOn)}
                    <Tooltip title={code.createdOn}>
                        <IconButton
                            style={{ cursor: "default", veriticalAlign: "top" }}
                            aria-label="created on"
                        >
                            <InfoIcon sx={{ fontSize: "medium" }} />
                        </IconButton>
                    </Tooltip>
                </Typography>
            </>
        );
    };

    const CardContent = code => {
        return (
            <Box
                sx={{
                    minHeight: "150px",
                    position: code.tags?.length === 0 && "absolute",
                    top: code.tags?.length === 0 && 18,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: 300,
                    }}
                >
                    {code.name}
                </Typography>

                <Box
                    style={{
                        ...label,
                        position: code.tags?.length === 0 && "absolute",
                        top: code.tags?.length === 0 && 30,
                    }}
                >
                    <CREATED_DATE code={code} />
                </Box>
                <Box
                    style={{
                        ...label,
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        marginBottom: "20px",
                        position: code.tags?.length === 0 && "absolute",
                        top: code.tags?.length === 0 && 75,
                    }}
                >
                    <span style={{ fontWeight: "normal" }}>
                        {code.dbNames?.map(database => (
                            <Chip
                                key={database}
                                label={database}
                                sx={{
                                    fontSize: "12px",
                                    bgcolor: theme.palette.primary.light,
                                    margin: "2px",
                                    fontWeight: 700,
                                    color: "grey.900",
                                }}
                                size="small"
                            />
                        ))}
                    </span>
                </Box>
                <Box
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                    ref={refForTag}
                >
                    {code.tags?.map(tag => (
                        <Chip
                            key={tag}
                            label={tag}
                            variant="outlined"
                            sx={{ border: `1px solid ${theme.palette.primary.main}` }}
                            size="small"
                        />
                    ))}
                </Box>
            </Box>
        );
    };

    return (
        <>
            {codes?.map(code => {
                const key = code.id + code.name + code.owner;
                return (
                    <div key={key} aria-label={key} style={{ minHeight: "150px" }}>
                        <BasicActionableCard
                            handleOnClick={() => viewCode(code)}
                            cardContent={CardContent(code)}
                            style={{
                                bgcolor: isDarkMode && theme.palette.grey.light,
                                height: "100%",
                            }}
                        />
                    </div>
                );
            })}
        </>
    );
});

const LatestStudiesAndCodes = observer(() => {
    const studiesRef = React.useRef(null);
    const medicalRef = React.useRef(null);
    const drugRef = React.useRef(null);

    React.useEffect(() => {
        (async () => {
            await dashboardStore.loadLatestStudiesAndCodes();
        })();
    }, []);

    const hasLatestStudiesAndCodes = dashboardStore.hasStudiesAndCodes;

    return (
        <>
            {hasLatestStudiesAndCodes && (
                <Grid size={8}>
                    <BasicCarousel
                        content={<LatestStudies />}
                        title="Latest Studies"
                        data={dashboardStore?.data?.latestStudies}
                        ref={studiesRef}
                    />
                    <BasicCarousel
                        content={
                            <LatestCodes
                                codes={dashboardStore?.data?.latestMedCodes}
                                store={medicalStore}
                                type="medical"
                            />
                        }
                        title="Latest Medical Codes"
                        data={dashboardStore?.data?.latestMedCodes}
                        ref={medicalRef}
                    />

                    <BasicCarousel
                        content={
                            <LatestCodes
                                codes={dashboardStore?.data?.latestDrugCodes}
                                store={drugStore}
                                type="drug"
                            />
                        }
                        title="Latest Drug Codes"
                        data={dashboardStore?.data?.latestDrugCodes}
                        ref={drugRef}
                    />
                </Grid>
            )}
        </>
    );
});

export default LatestStudiesAndCodes;
