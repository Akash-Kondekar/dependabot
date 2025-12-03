import React, { useRef } from "react";
import period from "../../../state/store/study/period.js";
import {
    CROSS_SECTIONAL,
    FEASIBILITY,
    INC_PREV,
    STUDY_TYPES,
    UNEDITABLE_FILE,
} from "../../../constants/index.jsx";
import JSZip from "jszip";
import expose from "../../../state/store/study/expose.js";
import unexposed from "../../../state/store/study/unexposed.js";
import baseline from "../../../state/store/study/baseline.js";
import outcome from "../../../state/store/study/outcome.js";
import { Grid2 as Grid, Stack, Tooltip } from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { FileDownload } from "@mui/icons-material";
import StudyPeriodSummary from "./StudyPeriodSummary.jsx";
import StudyPopulationSummary from "./Population.jsx";
import ExposureSummary from "./ExposureSummary.jsx";
import ControlSummary from "./ControlSummary.jsx";
import MatchSummary from "./MatchSummary.jsx";
import BaselineSummary from "./BaselineSummary.jsx";
import MultipleRecordsSummary from "./MultipleRecordsSummary.jsx";
import OutcomeSummary from "./OutcomeSummary.jsx";
import DisplayComparisonResult, {
    getStudyWarningData,
} from "../StudyQuality/DisplayComparisonResult.jsx";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { BasicButton } from "../../Common/BasicButton.jsx";
import { ShowSuccess, ShowWarning } from "../../Common/Toast.jsx";

export function SummaryDetails({ descriptionElementRef, setActiveStepFromSummary = undefined }) {
    const { opFilename, studyDesign, visOrComp } = period.data;
    const addon = visOrComp === UNEDITABLE_FILE;

    const comparisonResults = React.useMemo(
        () => getStudyWarningData() || [],
        [
            expose.data.casesNeeded,
            expose.data.clinicalCodeListMedical,
            expose.data.clinicalCodeListTherapy,
            expose.data.ahdBeanList,
            outcome.data.clinicalCodeList,
            outcome.data.ahdBeanList,
        ]
    );

    const downloadCodesHelperText = addon
        ? "Download baseline-outcome medical and drug code lists in this add-on"
        : "Download medical and drug code lists in this study";

    const textAreaRef = useRef(null);

    const copyToClipboard = () => {
        const text = textAreaRef.current?.innerText;

        navigator.clipboard?.writeText(text)?.then(
            () => {
                ShowSuccess("Content Copied Successfully");
            },
            () => {
                ShowWarning("Error copying text to clipboard");
            }
        );
    };

    //Header line for the code list csv files
    const headers = ["Code", "Description"];

    function extractCodesFromList(codeList) {
        if (codeList.codes && codeList.exposureType !== UNEDITABLE_FILE) {
            const csvRows = [];

            csvRows.push(headers.join(","));

            Object.entries(codeList.codes).forEach(([code, description]) => {
                const escapedDescription = description.replace(/"/g, '""');
                csvRows.push(`${code},"${escapedDescription}"`);
            });
            return csvRows.join("\n");
        }
    }

    const objCompressionType = { compression: "DEFLATE" };

    const downloadCodeLists = async () => {
        // Create a new JSZip instance
        const zip = new JSZip();
        // Process each item in clinicalCodeList

        if (!addon) {
            period?.data?.population?.clinicalCodeListMedical?.forEach(codeList => {
                const listOfCodes = extractCodesFromList(codeList);
                zip.file(`${codeList.filename}.csv`, listOfCodes, objCompressionType);
            });

            period?.data?.population?.clinicalCodeListTherapy?.forEach(codeList => {
                const listOfCodes = extractCodesFromList(codeList);
                zip.file(`${codeList.filename}.csv`, listOfCodes, objCompressionType);
            });

            expose?.data?.clinicalCodeListMedical?.forEach(codeList => {
                const listOfCodes = extractCodesFromList(codeList);
                zip.file(`${codeList.filename}.csv`, listOfCodes, objCompressionType);
            });

            expose?.data?.clinicalCodeListTherapy?.forEach(codeList => {
                const listOfCodes = extractCodesFromList(codeList);
                zip.file(`${codeList.filename}.csv`, listOfCodes, objCompressionType);
            });

            unexposed?.data?.clinicalCodeListMedical?.forEach(codeList => {
                const listOfCodes = extractCodesFromList(codeList);
                zip.file(`${codeList.filename}.csv`, listOfCodes, objCompressionType);
            });

            unexposed?.data?.clinicalCodeListTherapy?.forEach(codeList => {
                const listOfCodes = extractCodesFromList(codeList);
                zip.file(`${codeList.filename}.csv`, listOfCodes, objCompressionType);
            });
        }

        baseline?.data?.clinicalCodeList?.forEach(codeList => {
            const listOfCodes = extractCodesFromList(codeList);
            zip.file(`${codeList.filename}.csv`, listOfCodes, objCompressionType);
        });

        outcome?.data?.clinicalCodeList?.forEach(codeList => {
            const listOfCodes = extractCodesFromList(codeList);
            zip.file(`${codeList.filename}.csv`, listOfCodes, objCompressionType);
        });

        // Generate zip file
        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Trigger download
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(zipBlob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${opFilename}.zip`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div ref={textAreaRef}>
            <Box sx={{ mt: 1 }}>
                <Box sx={{ m: 1, p: 1 }}>
                    <Grid container spacing={1} justifyContent="space-between" alignItems="center">
                        <Grid size={6}>
                            <Stack>
                                <Typography
                                    variant="h6"
                                    component="h2"
                                    sx={{
                                        wordBreak: "break-word",
                                        overflowWrap: "anywhere",
                                        whiteSpace: "normal",
                                    }}
                                >
                                    {opFilename !== undefined &&
                                        opFilename !== "" &&
                                        `Name: ${opFilename}`}
                                </Typography>
                                <Typography variant="h6" component="h2">
                                    Design: {STUDY_TYPES[studyDesign]}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid size={6} sx={{ textAlign: "right" }}>
                            <>
                                {copyToClipboard && (
                                    <Tooltip title={"Copy study design"}>
                                        <BasicButton
                                            variant="outlined"
                                            handleClick={() => copyToClipboard()}
                                            buttonText="Copy study design"
                                            endIcon={<FileCopyIcon />}
                                        />
                                    </Tooltip>
                                )}

                                <Tooltip title={downloadCodesHelperText}>
                                    <BasicButton
                                        aria-label={downloadCodesHelperText}
                                        variant="outlined"
                                        handleClick={() => downloadCodeLists()}
                                        buttonText="Download codelists"
                                        endIcon={<FileDownload />}
                                    />
                                </Tooltip>
                            </>
                        </Grid>
                    </Grid>
                </Box>
                <Box
                    id="study-summary-details-box"
                    ref={descriptionElementRef}
                    tabIndex={-1}
                    sx={{ mt: 2 }}
                >
                    {comparisonResults.length > 0 ? (
                        <DisplayComparisonResult comparisonResults={comparisonResults} />
                    ) : null}

                    <StudyPeriodSummary setStep={setActiveStepFromSummary} />

                    <StudyPopulationSummary setStep={setActiveStepFromSummary} />

                    {![CROSS_SECTIONAL, INC_PREV].includes(studyDesign) && (
                        <ExposureSummary
                            setStep={setActiveStepFromSummary}
                            studyDesign={studyDesign}
                        ></ExposureSummary>
                    )}

                    {![CROSS_SECTIONAL, INC_PREV, FEASIBILITY].includes(studyDesign) && (
                        <>
                            <ControlSummary
                                setStep={setActiveStepFromSummary}
                                studyDesign={studyDesign}
                            />
                            <MatchSummary
                                setStep={setActiveStepFromSummary}
                                studyDesign={studyDesign}
                            />
                        </>
                    )}

                    <BaselineSummary
                        setStep={setActiveStepFromSummary}
                        studyDesign={studyDesign}
                        addon={addon}
                    />

                    {addon && (
                        <MultipleRecordsSummary
                            setStep={setActiveStepFromSummary}
                            studyDesign={studyDesign}
                            addon={addon}
                        />
                    )}

                    {![CROSS_SECTIONAL, INC_PREV].includes(studyDesign) && (
                        <>
                            <OutcomeSummary
                                setStep={setActiveStepFromSummary}
                                studyDesign={studyDesign}
                                addon={addon}
                            />
                        </>
                    )}
                </Box>
            </Box>
        </div>
    );
}

export default SummaryDetails;
