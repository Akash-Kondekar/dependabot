import React from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    Collapse,
    Paper,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import Alert from "@mui/material/Alert";
import expose from "../../../state/store/study/expose";
import outcome from "../../../state/store/study/outcome";
import { OUTCOME_DRUGS, OUTCOME_MEDS } from "../../../constants";
import { findCommonCodePairs, findCommonCodePairsAHD } from "../../../utils";

const DisplayComparisonResult = ({ comparisonResults }) => {
    const [open, setOpen] = React.useState(true);

    if (!comparisonResults || comparisonResults.length === 0) {
        return;
    }

    return (
        <>
            <Collapse in={open}>
                <Paper elevation={3}>
                    <Alert
                        variant="outlined"
                        severity="info"
                        onClose={() => {
                            setOpen(false);
                        }}
                    >
                        Overlapping codes have been detected in the exposure and outcome
                        definitions. While this may be appropriate for some study designs, it can
                        introduce misclassification bias or temporal ambiguity. Please carefully
                        review the code lists and consider sensitivity analyses to assess potential
                        impact on results.
                        {comparisonResults.map((pair, index) => (
                            <Accordion key={index} disableGutters>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        "&.Mui-expanded": {
                                            minHeight: "48px",
                                        },
                                        minHeight: "48px",
                                        "& .MuiAccordionSummary-content": {
                                            margin: "12px 0",
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            width: "100%",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Typography variant="body2">
                                                {pair?.exposure || "Unknown"}
                                            </Typography>
                                            <ArrowRightAltIcon
                                                sx={{ fontSize: 20, color: "text.secondary" }}
                                            />
                                            <Typography variant="body2">
                                                {pair?.outcome || "Unknown"}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={`${
                                                pair?.commonCodes
                                                    ? Object.keys(pair.commonCodes).length
                                                    : 0
                                            } codes`}
                                            size="small"
                                            sx={{ ml: 2 }}
                                        />
                                    </Box>
                                </AccordionSummary>

                                <AccordionDetails sx={{ py: 1, px: 3 }}>
                                    {pair?.commonCodes &&
                                        Object.entries(pair.commonCodes).map(
                                            ([code, description]) => (
                                                <Box key={code} sx={{ py: 0.5 }}>
                                                    <Typography variant="body2">
                                                        <Box
                                                            component="span"
                                                            sx={{ color: "text.secondary" }}
                                                        >
                                                            {code}:
                                                        </Box>{" "}
                                                        {description}
                                                    </Typography>
                                                </Box>
                                            )
                                        )}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Alert>
                </Paper>
                <br />
            </Collapse>
        </>
    );
};

export function getStudyWarningData() {
    // Compute the initial state value without calling `setComparisonResults`
    if (expose.data.casesNeeded) {
        let results = [];

        if (
            expose.data.clinicalCodeListMedical &&
            expose.data.clinicalCodeListMedical.length > 0 &&
            outcome.data.clinicalCodeList &&
            outcome.data.clinicalCodeList.filter(a => a.fileType === OUTCOME_MEDS).length > 0
        ) {
            results = findCommonCodePairs(
                expose.data.clinicalCodeListMedical.filter(a => a.incl === true),
                outcome.data.clinicalCodeList.filter(a => a.fileType === OUTCOME_MEDS)
            );
        }

        if (
            expose.data.clinicalCodeListTherapy &&
            expose.data.clinicalCodeListTherapy.length > 0 &&
            outcome.data.clinicalCodeList &&
            outcome.data.clinicalCodeList.filter(a => a.fileType === OUTCOME_DRUGS)?.length > 0
        ) {
            results = results.concat(
                findCommonCodePairs(
                    expose.data.clinicalCodeListTherapy.filter(a => a.incl === true),
                    outcome.data.clinicalCodeList.filter(a => a.fileType === OUTCOME_DRUGS)
                )
            );
        }

        if (
            expose.data.ahdBeanList &&
            expose.data.ahdBeanList.length > 0 &&
            outcome.data.ahdBeanList &&
            outcome.data.ahdBeanList.length > 0
        ) {
            results = results.concat(
                findCommonCodePairsAHD(
                    expose.data.ahdBeanList.filter(a => a.incl === true),
                    outcome.data.ahdBeanList
                )
            );
        }

        return results;
    }

    return []; // Default value if `casesNeeded` is false
}

export default DisplayComparisonResult;
