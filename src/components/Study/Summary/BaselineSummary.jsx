import React from "react";
import baseline from "../../../state/store/study/baseline";
import {
    AHD_BEAN_LIST_LABEL,
    BASELINE_AHD,
    BASELINE_DRUGS,
    BASELINE_MEDS,
    baselineVariableTypeOfRecordLabelMap,
    CROSS_SECTIONAL,
    FEASIBILITY,
    INC_PREV,
    UNEDITABLE_FILE,
} from "../../../constants";
import { Card, CardContent, CardHeader, Divider } from "@mui/material";
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

const BaselineSummary = ({ setStep, studyDesign, addOn }) => {
    const { clinicalCodeList, ahdBeanList } = baseline.data;

    const MarginLabel = ({ beforeDays, addSubDaysToIndex }) => {
        if (beforeDays === 0 && addSubDaysToIndex === 0) {
            return null;
        }
        if (beforeDays === 0 && addSubDaysToIndex !== 0) {
            const beforeOrAfter = addSubDaysToIndex > 0 ? "adding " : "removing ";
            const toAndFrom = addSubDaysToIndex > 0 ? " to " : " from  ";
            return (
                <>
                    {" collected by "} {beforeOrAfter}
                    {addSubDaysToIndex} {" days"} {toAndFrom} {"index date "}
                </>
            );
        }
        if (beforeDays !== 0 && addSubDaysToIndex === 0) {
            return (
                <>
                    {" collected no more than "}
                    {beforeDays} {" days before index date "}
                </>
            );
        }
        if (beforeDays !== 0 && addSubDaysToIndex !== 0) {
            const leftMargin =
                "days " + (beforeDays < 0 ? " before " : " after ") + " the index date ";
            const rightMargin =
                " days " + (addSubDaysToIndex < 0 ? " before " : " after ") + " the index date ";

            return (
                <>
                    {" collected between "}
                    {beforeDays} {leftMargin}
                    {" and "}
                    {addSubDaysToIndex} {rightMargin}
                </>
            );
        }
    };

    const clinicalCodeListForSummary = clinicalCodeList.filter(
        a =>
            a.matchingReq === false &&
            a.exposureType !== UNEDITABLE_FILE &&
            a.incl === true &&
            [BASELINE_MEDS, BASELINE_DRUGS].includes(a.fileType)
    );

    const ahdBeanListForSummary = ahdBeanList.filter(
        a =>
            a.matchingReq === false &&
            a.exposureType !== UNEDITABLE_FILE &&
            a.incl === true &&
            a.fileType === BASELINE_AHD
    );

    const hasBaseline =
        (clinicalCodeListForSummary !== undefined && clinicalCodeListForSummary.length > 0) ||
        (ahdBeanListForSummary !== undefined && ahdBeanListForSummary.length > 0);

    const classes = styles();

    let baselineCharacteristicsTitle = "Baseline Characteristics";

    if (studyDesign === INC_PREV) {
        baselineCharacteristicsTitle = "Variables for calculating incidence/prevalence";
    } else if (studyDesign === CROSS_SECTIONAL) {
        baselineCharacteristicsTitle = "Variables for calculating prevalence";
    }

    const setTheStep = step => {
        addOn ? setStep(step + 1) : setStep(step);
    };

    return (
        <Card className={classes.root}>
            <CardHeader
                title={baselineCharacteristicsTitle}
                className={classes.title}
                action={
                    setStep && (
                        <IconButton aria-label="edit">
                            <EditIcon
                                onClick={() => {
                                    const stepForCrossSecAndIncPrev = 2;
                                    const stepForFeasibility = 3;
                                    const stepForOtherStudies = 5;
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
                {hasBaseline ? (
                    <List sx={{ listStyle: "decimal", pl: 1, marginLeft: "20px" }}>
                        {clinicalCodeListForSummary.map(variable => {
                            return (
                                <ListItem key={variable.label} sx={{ display: "list-item" }}>
                                    <ListItemText>
                                        <strong>{variable.filename}</strong>
                                        {` is defined as `}
                                        <strong>
                                            {baselineVariableTypeOfRecordLabelMap.get(
                                                variable.typeOfRecord
                                            )}
                                        </strong>
                                        {variable.typeOfRecord !== 3 && (
                                            <MarginLabel
                                                addSubDaysToIndex={variable.addSubDaysToIndex}
                                                beforeDays={variable.beforeDays}
                                            />
                                        )}
                                        <GetCodes rowData={variable} type={variable.filename} />
                                    </ListItemText>
                                </ListItem>
                            );
                        })}
                        {ahdBeanListForSummary?.map(ahd => {
                            return (
                                <ListItem key={ahd.label} sx={{ display: "list-item" }}>
                                    <ListItemText>
                                        <strong>{ahd.label}</strong>
                                        {` is defined as `}
                                        <strong>
                                            {baselineVariableTypeOfRecordLabelMap.get(
                                                ahd.typeOfRecord
                                            )}
                                        </strong>
                                        {ahd.typeOfRecord !== 3 && (
                                            <MarginLabel
                                                addSubDaysToIndex={ahd.addSubDaysToIndex}
                                                beforeDays={ahd.beforeDays}
                                            />
                                        )}
                                        {ahd.userQuery !== "" ? " with " + ahd.userQuery : ""}
                                        <GetCodes rowData={ahd} type={AHD_BEAN_LIST_LABEL} />
                                    </ListItemText>
                                </ListItem>
                            );
                        })}
                    </List>
                ) : (
                    <>This study does not include any baseline variables</>
                )}
            </CardContent>
        </Card>
    );
};

export default BaselineSummary;
