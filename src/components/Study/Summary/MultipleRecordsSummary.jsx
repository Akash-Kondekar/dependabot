import React from "react";
import baseline from "../../../state/store/study/baseline";
import {
    AHD_BEAN_LIST_LABEL,
    BASELINE_AHD,
    BASELINE_DRUGS,
    BASELINE_MEDS,
    baselineVariableTypeOfMultipleRecordLabelMap,
    CROSS_SECTIONAL,
    FEASIBILITY,
    INC_PREV,
    MR_TITLE,
    UNEDITABLE_FILE,
    UNIT_OF_TIME,
} from "../../../constants";
import { Card, CardContent, CardHeader, Divider, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import { GetCodes } from "../../Common";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";

const styles = makeStyles(() => ({
    title: {
        fontWeight: 500,
        fontSize: "22px",
    },
    content: {
        fontSize: "17px",
        lineHeight: "2",
    },
    root: {
        marginBottom: "25px",
    },
}));

const MultipleRecordsSummary = ({ setStep, studyDesign, addOn }) => {
    const {
        clinicalCodeList,
        ahdBeanList,
        needConsultRecords,
        consultTypeReq,
        needTimeSeries,
        timeSeriesLength,
    } = baseline.data;

    const clinicalCodeListForSummary = clinicalCodeList.filter(
        a =>
            a.matchingReq === false &&
            a.exposureType !== UNEDITABLE_FILE &&
            a.incl === false &&
            [BASELINE_MEDS, BASELINE_DRUGS].includes(a.fileType)
    );
    const ahdBeanListForSummary = ahdBeanList.filter(
        a =>
            a.matchingReq === false &&
            a.exposureType !== UNEDITABLE_FILE &&
            a.incl === false &&
            a.fileType === BASELINE_AHD
    );

    const timeSeriesText = needTimeSeries
        ? " collected at " +
          timeSeriesLength +
          " " +
          UNIT_OF_TIME +
          " intervals, starting from each participant's index date and continuing until their exit date"
        : "";

    const hasBaseline =
        (clinicalCodeListForSummary !== undefined && clinicalCodeListForSummary.length > 0) ||
        (ahdBeanListForSummary !== undefined && ahdBeanListForSummary.length > 0);

    const classes = styles();

    const setTheStep = step => {
        addOn ? setStep(step + 1) : setStep(step);
    };

    return (
        <Card className={classes.root}>
            <CardHeader
                title={MR_TITLE}
                className={classes.title}
                action={
                    setStep && (
                        <IconButton aria-label="edit">
                            <EditIcon
                                onClick={() => {
                                    const stepForCrossSecAndIncPrev = 3;
                                    const stepForFeasibility = 4;
                                    const stepForOtherStudies = 6;

                                    if ([CROSS_SECTIONAL, INC_PREV].includes(studyDesign)) {
                                        setTheStep(stepForCrossSecAndIncPrev);
                                    } else if (studyDesign === FEASIBILITY) {
                                        setTheStep(stepForFeasibility);
                                    } else {
                                        setTheStep(stepForOtherStudies);
                                    }
                                }}
                            />
                        </IconButton>
                    )
                }
            />
            <Divider variant="middle" sx={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
            <CardContent>
                {needConsultRecords && (
                    <div>
                        <Typography gutterBottom variant="h6" component="div">
                            Participant Consultation Records
                        </Typography>
                        <Typography variant="body1" component="div">
                            {`In this study we have extracted all participant consultation
                            ${baselineVariableTypeOfMultipleRecordLabelMap.get(consultTypeReq)} `}
                        </Typography>
                    </div>
                )}
                {hasBaseline ? (
                    <div style={{ marginTop: "20px" }}>
                        <Typography gutterBottom variant="h6" component="div">
                            Time-series Data
                        </Typography>
                        <Typography variant="body1" component="div">
                            {`For every participant we have extracted the following variables ${timeSeriesText}`}
                        </Typography>
                        <List sx={{ listStyle: "decimal", pl: 1, marginLeft: "20px" }}>
                            {clinicalCodeListForSummary.map(variable => {
                                return (
                                    <ListItem key={variable.label} sx={{ display: "list-item" }}>
                                        <ListItemText>
                                            <strong>{variable.filename}</strong>
                                            {!needTimeSeries && (
                                                <>
                                                    {` defined as all `}
                                                    <strong>
                                                        {baselineVariableTypeOfMultipleRecordLabelMap.get(
                                                            variable.matchWith
                                                        )}
                                                    </strong>
                                                </>
                                            )}
                                            <GetCodes rowData={variable} type={variable.filename} />
                                        </ListItemText>
                                    </ListItem>
                                );
                            })}
                            {ahdBeanListForSummary.map(ahd => {
                                return (
                                    <ListItem key={ahd.label} sx={{ display: "list-item" }}>
                                        <ListItemText>
                                            <strong>{ahd.label}</strong>
                                            {!needTimeSeries && (
                                                <>
                                                    {` defined as all `}
                                                    <strong>
                                                        {baselineVariableTypeOfMultipleRecordLabelMap.get(
                                                            ahd.matchWith
                                                        )}
                                                    </strong>
                                                </>
                                            )}
                                            {ahd.userQuery !== "" ? " with " + ahd.userQuery : ""}
                                            <GetCodes rowData={ahd} type={AHD_BEAN_LIST_LABEL} />
                                        </ListItemText>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </div>
                ) : (
                    <>The study does not include any additional time-series variables</>
                )}
            </CardContent>
        </Card>
    );
};

export default MultipleRecordsSummary;
