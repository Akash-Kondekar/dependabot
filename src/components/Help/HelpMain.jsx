import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Grid2 as Grid, Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import remarkGfm from "remark-gfm";
import { useTheme } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import ClickableCard from "../Common/ClickableCard.jsx";
import { DOCUMENTATION_CARDS } from "../../constants";
import helpFileRaw from "../../mds/_index.md?raw";
import analyticsRaw from "../../mds/Analytics/_index.md?raw";
import addonsFileRaw from "../../mds/Additional-variables/_index.md?raw";
import extractedDatasetsRaw from "../../mds/Extracted-datasets/_index.md?raw";
import databasesAndGovernanceRaw from "../../mds/Data-governance/_index.md?raw";
import projectsRaw from "../../mds/Projects/_index.md?raw";
import studyprotocolsRaw from "../../mds/StudyProtocols/_index.md?raw";
import codebuilderRaw from "../../mds/Code-builder/_index.md?raw";
import studydesignsRaw from "../../mds/Study-design-and-data-extraction/_index.md?raw";
import addcodesRaw from "../../mds/Study-design-and-data-extraction/addvariables.md?raw";
import baselineRaw from "../../mds/Study-design-and-data-extraction/baseline.md?raw";
import outcomeRaw from "../../mds/Study-design-and-data-extraction/outcome.md?raw";
import controlandmatchingRaw from "../../mds/Study-design-and-data-extraction/controlandmatching.md?raw";
import exposedRaw from "../../mds/Study-design-and-data-extraction/exposed.md?raw";
import studyperiodRaw from "../../mds/Study-design-and-data-extraction/studyperiod.md?raw";
import citeRaw from "../../mds/More/CiteDExtER.md?raw";
import privacyPolicyRaw from "../../mds/Terms/privacy.md?raw";
import cookiePolicyRaw from "../../mds/Terms/cookies.md?raw";

// Create a mapping object for easier maintenance
const markdownContentMap = {
    default: helpFileRaw,
    governance: databasesAndGovernanceRaw,
    projects: projectsRaw,
    phenotypelibrary: codebuilderRaw,
    studyprotocols: studyprotocolsRaw,
    designs: studydesignsRaw,
    studyperiod: studyperiodRaw,
    exposure: exposedRaw,
    controlandmatch: controlandmatchingRaw,
    baseline: baselineRaw,
    outcome: outcomeRaw,
    addvariables: addcodesRaw,
    extracteddata: extractedDatasetsRaw,
    addons: addonsFileRaw,
    results: analyticsRaw,
    cite: citeRaw,
    privacy: privacyPolicyRaw,
    cookies: cookiePolicyRaw,
};

export const Help = ({ resource }) => {
    const [helpData, setHelpData] = useState("Loading");
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Get the markdown content directly from our mapping
        const content = markdownContentMap[resource] || markdownContentMap.default;
        setHelpData(content);
    }, [resource, location]);

    return (
        <div style={{ margin: "20px", padding: "20px" }}>
            {helpData && (
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <Paper elevation={2} style={{ padding: "20px" }}>
                            <Typography component="div">
                                <div
                                    className={
                                        theme.palette.mode === "dark"
                                            ? "markdown-body-dark"
                                            : "markdown-body-light"
                                    }
                                >
                                    <ReactMarkdown
                                        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
                                    >
                                        {helpData}
                                    </ReactMarkdown>
                                </div>
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}
            <Grid container spacing={4}>
                {location?.state?.title === "Documentation" && (
                    <>
                        <Grid size={12}>
                            <Typography variant="h3">Getting started</Typography>
                            <Typography variant="body1" style={{ marginBottom: "10px" }}>
                                We are glad you have made it here. Get started by understanding
                                Dexters various systems and features.
                            </Typography>
                        </Grid>
                        {DOCUMENTATION_CARDS.map(option => {
                            return (
                                <Grid
                                    key={option.title}
                                    size={{
                                        xs: 12,
                                        md: 6,
                                        lg: 4,
                                    }}
                                >
                                    <ClickableCard
                                        title={option.title}
                                        content={option.content}
                                        onClick={() => navigate(option.to)}
                                    />
                                </Grid>
                            );
                        })}
                    </>
                )}
            </Grid>
        </div>
    );
};
