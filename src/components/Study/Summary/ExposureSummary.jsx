import React from "react";
import expose from "../../../state/store/study/expose";
import {
    AHD_BEAN_LIST_LABEL,
    CASE_CONTROL,
    CROSS_SECTIONAL,
    exclusionCriteriaLabelMap,
    INC_PREV,
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

const ExposureSummary = ({ setStep, studyDesign }) => {
    const {
        casesNeeded,
        clinicalCodeListMedical,
        clinicalCodeListTherapy,
        ahdBeanList,
        washOutDays,
        caseParseStrict,
        inclusion,
    } = expose.data;
    const setTheStep = step => {
        setStep(step);
    };
    const classes = styles();

    const caseParseStrictLabel = caseParseStrict
        ? " occurring in chronological order"
        : " regardless of which event occurred first";

    const moreThanOneCodeRecorded = expose.numberOfIncludedCodes > 1;

    let defineSummaryExposure = "In this study, the exposed group is defined as";
    let cardTitle = "Study Exposure";
    let participantsIncluded = "This study does not include any exposed participants";

    if (studyDesign === CASE_CONTROL) {
        defineSummaryExposure = "In this study, the case group is defined as";
        cardTitle = "Case";
        participantsIncluded = "This study does not include any case participants";
    } else if (studyDesign === INC_PREV || studyDesign === CROSS_SECTIONAL) {
        defineSummaryExposure = "In this study, the population is defined as";
        cardTitle = "Study Population";
        participantsIncluded = "This study includes all participants";
    }

    return (
        <div>
            <Card className={classes.root}>
                <CardHeader
                    title={cardTitle}
                    className={classes.title}
                    action={
                        setStep && (
                            <IconButton aria-label="edit">
                                <EditIcon onClick={() => setTheStep(2)} />
                            </IconButton>
                        )
                    }
                />
                <Divider variant="middle" sx={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
                {casesNeeded !== undefined && casesNeeded ? (
                    <CardContent>
                        <div>
                            <Typography variant="body1" gutterBottom>
                                {`${defineSummaryExposure} `}
                                {moreThanOneCodeRecorded
                                    ? "participants with a combination of the following conditions "
                                    : "participants with the following condition "}
                                {moreThanOneCodeRecorded ? caseParseStrictLabel : " -"}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                <strong>{inclusion}</strong>
                            </Typography>
                        </div>

                        {expose.numberOfIncludedCodes && (
                            <div style={{ marginTop: "20px" }}>
                                <Typography gutterBottom variant="h6" component="div">
                                    Inclusion criteria
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
                                                        {" is defined as "}
                                                        <strong>
                                                            {inclusionCriteriaLabelMap.get(
                                                                medical.exposureType
                                                            )}
                                                        </strong>
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
                                                            {`${inclusionCriteriaLabelMap.get(
                                                                therapy.exposureType
                                                            )} `}
                                                        </strong>
                                                        {`with at least one prescription issued `}
                                                        {therapy.years !== 0 && therapy.months !== 0
                                                            ? `every ${therapy.years} ${UNIT_OF_TIME} for a total of ${therapy.months} times `
                                                            : ""}
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
                                                <ListItem
                                                    key={ahd.label}
                                                    sx={{ display: "list-item" }}
                                                >
                                                    <ListItemText>
                                                        <strong>{ahd.label}</strong>
                                                        {" is defined as "}
                                                        <strong>
                                                            {inclusionCriteriaLabelMap.get(
                                                                ahd.exposureType
                                                            )}
                                                        </strong>
                                                        {ahd.userQuery !== ""
                                                            ? " with " + ahd.userQuery
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
                                Index date
                            </Typography>
                            <Typography>
                                {
                                    "Index date is defined as the day when participants met the above inclusion criteria."
                                }
                                {washOutDays > 0
                                    ? " A latency (lag) period of " +
                                      washOutDays +
                                      " days is added to the index date to avoid biases"
                                    : " No latency (lag) period is added"}
                                .
                            </Typography>
                        </div>

                        {expose.numberOfExcludedCodes > 0 && (
                            <div style={{ marginTop: "20px" }}>
                                <Typography gutterBottom variant="h6" component="div">
                                    Exclusion criteria
                                </Typography>
                                <Typography>
                                    Furthermore, participants would not take part in this study if
                                    they had -
                                </Typography>
                                <Typography>
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
                                                            <strong>
                                                                {medical.filename + " "}
                                                            </strong>
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
                                                    <ListItem
                                                        key={ahd.label}
                                                        sx={{ display: "list-item" }}
                                                    >
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
                                                                ? " with " + ahd.userQuery
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
                                </Typography>
                            </div>
                        )}
                    </CardContent>
                ) : (
                    <CardContent>{participantsIncluded}</CardContent>
                )}
            </Card>
        </div>
    );
};

export default ExposureSummary;
