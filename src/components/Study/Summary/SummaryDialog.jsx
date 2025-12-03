import * as React from "react";
import { useRef } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import StudyPeriodSummary from "./Period";
import StudyPopulationSummary from "./Population";
import ExposureSummary from "./ExposureSummary";
import ControlSummary from "./ControlSummary";
import MatchSummary from "./MatchSummary";
import BaselineSummary from "./BaselineSummary";
import OutcomeSummary from "./OutcomeSummary";
import period from "../../../state/store/study/period";
import {
    CROSS_SECTIONAL,
    FEASIBILITY,
    INC_PREV,
    STUDY_TYPES,
    UNEDITABLE_FILE,
} from "../../../constants";
import MultipleRecordsSummary from "./MultipleRecordsSummary";
import IconButton from "@mui/material/IconButton";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { Grid2 as Grid, Stack, Tooltip } from "@mui/material";
import { FileDownload } from "@mui/icons-material";
import expose from "../../../state/store/study/expose";
import JSZip from "jszip";
import unexposed from "../../../state/store/study/unexposed";
import baseline from "../../../state/store/study/baseline";
import outcome from "../../../state/store/study/outcome";
import DisplayComparisonResult, {
    getStudyWarningData,
} from "../StudyQuality/DisplayComparisonResult";
import { ShowSuccess } from "../../Common";
import { ShowWarning } from "../../../componentsV2/Common/Toast";

export function SummaryDetails({ descriptionElementRef, setActiveStepFromSummary = undefined }) {
    const { opFilename, studyDesign, visOrComp } = period.data;
    const addon = visOrComp === UNEDITABLE_FILE;

    const comparisonResults = React.useMemo(() => getStudyWarningData() || [], []);

    const studyType = addon
        ? "Download baseline-outcome medical and drug code lists in this add-on"
        : "Download medical and drug code lists in this study";

    const textAreaRef = useRef(null);

    const copyToClipboard = () => {
        const text = textAreaRef.current.innerText;

        navigator.clipboard.writeText(text).then(
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
        <>
            <div ref={textAreaRef}>
                <DialogTitle id="scroll-dialog-title">
                    <Grid container>
                        <Grid size={10}>
                            <Stack>
                                <span>
                                    {opFilename !== undefined && opFilename !== "" && (
                                        <>Study Name: {opFilename}</>
                                    )}
                                </span>
                                <span>Study Design: {STUDY_TYPES[studyDesign]}</span>
                            </Stack>
                        </Grid>
                        <Grid size={1}>
                            {copyToClipboard && (
                                <Tooltip title={"Copy study design"}>
                                    <IconButton
                                        aria-label="Copy study design"
                                        onClick={() => copyToClipboard()}
                                    >
                                        <FileCopyIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Grid>
                        <Grid size={1}>
                            <Tooltip title={studyType}>
                                <IconButton
                                    aria-label={studyType}
                                    onClick={() => downloadCodeLists()}
                                >
                                    <FileDownload />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent dividers={true}>
                    <DialogContentText
                        id="scroll-dialog-description"
                        ref={descriptionElementRef}
                        tabIndex={-1}
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
                    </DialogContentText>
                </DialogContent>
            </div>
        </>
    );
}

function SummaryDialog({ open, toggleDrawer, setActiveStepFromSummary }) {
    const descriptionElementRef = React.useRef(null);
    React.useEffect(() => {
        if (open) {
            const { current: descriptionElement } = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [open]);

    return (
        <React.Fragment>
            <Dialog
                fullWidth={true}
                maxWidth={"lg"}
                open={open}
                onClose={toggleDrawer}
                scroll={"paper"}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <SummaryDetails
                    setActiveStepFromSummary={setActiveStepFromSummary}
                    descriptionElementRef={descriptionElementRef}
                ></SummaryDetails>
                <DialogActions>
                    <Button onClick={() => toggleDrawer()}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

export default SummaryDialog;
