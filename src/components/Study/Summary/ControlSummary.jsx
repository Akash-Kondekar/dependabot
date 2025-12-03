import React from "react";
import unexposed from "../../../state/store/study/unexposed";
import {
    AHD_BEAN_LIST_LABEL,
    CASE_CONTROL,
    exclusionCriteriaLabelMap,
    inclusionCriteriaLabelMap,
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

const ControlSummary = ({ setStep, studyDesign }) => {
    const {
        ctrlsNeeded,
        clinicalCodeListMedical,
        clinicalCodeListTherapy,
        ahdBeanList,
        controlParseStrict,
        pharmacoEpiDesign,
        exclusion,
    } = unexposed.data;

    const classes = styles();

    const parseStrictLabel = controlParseStrict
        ? " occurring in chronological order"
        : " regardless of which event occurred first";
    const setTheStep = step => {
        setStep(step);
    };
    const moreThanOneCodeRecorded = unexposed.numberOfIncludedCodes > 1;

    let defineComparatorGroup =
        "In this study, the comparator group refers to all eligible individuals in the population except those in the Exposed group";

    let controlInclusionCriteriaHeading = "Inclusion criteria in unexposed participants";
    let controlExclusionCriteriaHeading = "Exclusion criteria in unexposed participants";
    let controlsIndexDateHeading = "Index date of the unexposed participant";

    let indexControlDate = "set to the same time as that of the corresponding exposed participants";
    let indexControlDateInclusionParticipants =
        "set to the time they meet the inclusion criteria and not the exposed participants index date. But exposed participant's index date and unexposed participant's index date is to be within the same year";
    let comparatorGroupHeading = "unexposed group";
    let noComparatorVariables = "This study does not include any unexposed participants";

    if (studyDesign === CASE_CONTROL) {
        defineComparatorGroup =
            "In this study, the comparator group refers to all eligible individuals in the population except those in the Case group";
        controlInclusionCriteriaHeading = "Inclusion criteria in controls";
        controlExclusionCriteriaHeading = "Exclusion criteria in controls";

        controlsIndexDateHeading = "Index date of the control";
        indexControlDate = "set to the same time as that of the corresponding case participant";

        indexControlDateInclusionParticipants =
            "set to the time they meet the inclusion criteria and not the exposed participant's index date. But case participant's index date and control participant's index date is to be within the same year";
        comparatorGroupHeading = "case group";
        noComparatorVariables = "This study does not include any control participants";
    }

    return (
        <Card className={classes.root}>
            <CardHeader
                title="Comparator Group"
                className={classes.title}
                action={
                    setStep && (
                        <IconButton aria-label="edit">
                            <EditIcon onClick={() => setTheStep(3)} />
                        </IconButton>
                    )
                }
            />
            <Divider variant="middle" sx={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
            {ctrlsNeeded !== undefined && ctrlsNeeded ? (
                <CardContent>
                    <div>
                        {unexposed.numberOfIncludedCodes === 0 ? (
                            <>{defineComparatorGroup}</>
                        ) : (
                            <>
                                <Typography variant="body1" gutterBottom>
                                    {`In this study the ${comparatorGroupHeading} is defined as `}
                                    {moreThanOneCodeRecorded
                                        ? "participants with a combination of the following conditions "
                                        : "participant with the following condition "}
                                    {moreThanOneCodeRecorded ? parseStrictLabel : " -"}
                                </Typography>
                                <Typography variant="subtitle1" gutterBottom>
                                    <strong>{exclusion}</strong>
                                </Typography>
                            </>
                        )}
                    </div>

                    {unexposed.numberOfIncludedCodes > 0 && (
                        <div style={{ marginTop: "20px" }}>
                            <Typography gutterBottom variant="h6" component="div">
                                {controlInclusionCriteriaHeading}
                            </Typography>
                            <List sx={{ listStyle: "decimal", pl: 1, marginLeft: "20px" }}>
                                {clinicalCodeListMedical
                                    ?.filter(medical => medical.incl === true)
                                    .map(medical => {
                                        return (
                                            <ListItem
                                                key={medical.label}
                                                sx={{ display: "list-item" }}
                                            >
                                                <ListItemText>
                                                    <strong>{medical.filename}</strong>
                                                    {` is defined as `}
                                                    <strong>
                                                        {inclusionCriteriaLabelMap.get(
                                                            medical.exposureType
                                                        )}
                                                    </strong>
                                                    {medical.matchWith !== "none" && (
                                                        <>
                                                            {`. Further `}
                                                            <strong>{medical.filename}</strong>
                                                            {` is to be recorded either in the ${medical.beforeDays} ${UNIT_OF_TIME} before exposed participant's `}
                                                            <strong>{medical.matchWith}</strong>
                                                            {` event date, or within ${medical.afterDays} ${UNIT_OF_TIME} after. But overall, control's `}
                                                            <strong>{medical.filename}</strong>
                                                            {` should be before index date.`}
                                                        </>
                                                    )}
                                                    <GetCodes
                                                        rowData={medical}
                                                        type={medical.filename}
                                                    />
                                                </ListItemText>
                                            </ListItem>
                                        );
                                    })}
                                {clinicalCodeListTherapy
                                    ?.filter(therapy => therapy.incl === true)
                                    .map(therapy => {
                                        return (
                                            <ListItem
                                                key={therapy.label}
                                                sx={{ display: "list-item" }}
                                            >
                                                <ListItemText>
                                                    <strong>{therapy.filename}</strong>
                                                    {` is defined as `}
                                                    <strong>
                                                        {inclusionCriteriaLabelMap.get(
                                                            therapy.exposureType
                                                        )}
                                                    </strong>
                                                    {` with at least one prescription issued`}
                                                    {therapy.years !== 0 && therapy.months !== 0
                                                        ? ` every ${therapy.years} ${UNIT_OF_TIME} for a total of ${therapy.months} times`
                                                        : ""}
                                                    {therapy.matchWith !== "none" && (
                                                        <>
                                                            {`. Further `}
                                                            <strong>{therapy.filename}</strong>
                                                            {` is to be recorded either in the `}
                                                            {` ${therapy.beforeDays} ${UNIT_OF_TIME} before exposed participant's `}
                                                            <strong>{therapy.matchWith}</strong>
                                                            {` event date, or within ${therapy.afterDays} ${UNIT_OF_TIME} after. But overall, control's `}
                                                            <strong>{therapy.filename}</strong>
                                                            {` should be before index date.`}
                                                        </>
                                                    )}
                                                    <GetCodes
                                                        rowData={therapy}
                                                        type={therapy.filename}
                                                    />
                                                </ListItemText>
                                            </ListItem>
                                        );
                                    })}
                                {ahdBeanList
                                    ?.filter(ahd => ahd.incl === true)
                                    .map(ahd => {
                                        return (
                                            <ListItem key={ahd.label} sx={{ display: "list-item" }}>
                                                <ListItemText>
                                                    <strong>{ahd.label}</strong>
                                                    {` is defined as `}
                                                    <strong>
                                                        {inclusionCriteriaLabelMap.get(
                                                            ahd.exposureType
                                                        )}
                                                    </strong>
                                                    {ahd.userQuery !== ""
                                                        ? " with " + ahd.userQuery
                                                        : ""}
                                                    {ahd.matchWith !== "none" && (
                                                        <>
                                                            {`. Further `}
                                                            <strong>{ahd.label}</strong>
                                                            {` is to be recorded either in the ${ahd.beforeDays} ${UNIT_OF_TIME} before exposed participant's `}
                                                            <strong>{ahd.matchWith}</strong>
                                                            {` event date, or within ${ahd.afterDays} ${UNIT_OF_TIME} after. But overall, control's `}
                                                            <strong>{ahd.filename}</strong>
                                                            {` should be before index date.`}
                                                        </>
                                                    )}
                                                    <GetCodes
                                                        rowData={ahd}
                                                        type={AHD_BEAN_LIST_LABEL}
                                                    />
                                                </ListItemText>
                                            </ListItem>
                                        );
                                    })}
                            </List>
                        </div>
                    )}

                    {unexposed.numberOfExcludedCodes > 0 && (
                        <div style={{ marginTop: "20px" }}>
                            <Typography gutterBottom variant="h6" component="div">
                                {controlExclusionCriteriaHeading}
                            </Typography>
                            <List sx={{ listStyle: "decimal", pl: 1, marginLeft: "20px" }}>
                                {clinicalCodeListMedical
                                    ?.filter(medical => medical.incl === false)
                                    .map(medical => {
                                        return (
                                            <ListItem
                                                key={medical.label}
                                                sx={{ display: "list-item" }}
                                            >
                                                <ListItemText>
                                                    <strong>{medical.filename}</strong>
                                                    {medical.typeOfRecord === 3
                                                        ? ` ${exclusionCriteriaLabelMap.get(
                                                              medical.typeOfRecord
                                                          )}: ${
                                                              medical.addSubDaysToIndex
                                                          } ${UNIT_OF_TIME} `
                                                        : exclusionCriteriaLabelMap.get(
                                                              medical.typeOfRecord
                                                          )}
                                                    <GetCodes
                                                        rowData={medical}
                                                        type={medical.filename}
                                                    />
                                                </ListItemText>
                                            </ListItem>
                                        );
                                    })}
                                {clinicalCodeListTherapy
                                    ?.filter(therapy => therapy.incl === false)
                                    .map(therapy => {
                                        return (
                                            <ListItem
                                                key={therapy.label}
                                                sx={{ display: "list-item" }}
                                            >
                                                <ListItemText>
                                                    <strong>{therapy.filename}</strong>
                                                    {therapy.typeOfRecord === 3
                                                        ? ` ${exclusionCriteriaLabelMap.get(
                                                              therapy.typeOfRecord
                                                          )}: ${
                                                              therapy.addSubDaysToIndex
                                                          } ${UNIT_OF_TIME} `
                                                        : exclusionCriteriaLabelMap.get(
                                                              therapy.typeOfRecord
                                                          )}
                                                    <GetCodes
                                                        rowData={therapy}
                                                        type={therapy.filename}
                                                    />
                                                </ListItemText>
                                            </ListItem>
                                        );
                                    })}
                                {ahdBeanList
                                    ?.filter(ahd => ahd.incl === false)
                                    .map(ahd => {
                                        return (
                                            <ListItem key={ahd.label} sx={{ display: "list-item" }}>
                                                <ListItemText>
                                                    <strong>{ahd.label}</strong>
                                                    {ahd.typeOfRecord === 3
                                                        ? ` ${exclusionCriteriaLabelMap.get(
                                                              ahd.typeOfRecord
                                                          )}: ${
                                                              ahd.addSubDaysToIndex
                                                          } ${UNIT_OF_TIME} `
                                                        : exclusionCriteriaLabelMap.get(
                                                              ahd.typeOfRecord
                                                          )}
                                                    {ahd.userQuery !== ""
                                                        ? ` with ${ahd.userQuery}`
                                                        : ""}
                                                    <GetCodes
                                                        rowData={ahd}
                                                        type={AHD_BEAN_LIST_LABEL}
                                                    />
                                                </ListItemText>
                                            </ListItem>
                                        );
                                    })}
                            </List>
                        </div>
                    )}

                    <div style={{ marginTop: "20px" }}>
                        <Typography gutterBottom variant="h6" component="div">
                            {controlsIndexDateHeading}
                            {"s"}
                        </Typography>

                        <Typography>
                            {`${controlsIndexDateHeading} is `}
                            {pharmacoEpiDesign === 1
                                ? indexControlDate
                                : indexControlDateInclusionParticipants}
                        </Typography>
                    </div>
                </CardContent>
            ) : (
                <CardContent>{noComparatorVariables}</CardContent>
            )}
        </Card>
    );
};

export default ControlSummary;
