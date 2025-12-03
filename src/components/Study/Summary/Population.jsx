import React from "react";
import period from "../../../state/store/study/period";
import {
    AHD_BEAN_LIST_LABEL,
    exclusionCriteriaLabelMap,
    inclusionCriteriaLabelMap,
    summaryForSexOfThePopulation,
    UNIT_OF_TIME,
} from "../../../constants";
import { Card, CardContent, CardHeader, Divider, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { GetCodes } from "../../Common";

const useLocalStyles = makeStyles(() => ({
    title: {
        fontWeight: 500,
        fontSize: "22px",
    },
    root: {
        marginBottom: "25px",
    },
}));

const Population = ({ setStep = undefined }) => {
    const { addToPracticeDate1, addToPatientReg, minAge, maxAge, maxAgeAtExit, sex, population } =
        period.data;
    const {
        casesNeeded,
        clinicalCodeListMedical,
        clinicalCodeListTherapy,
        ahdBeanList,
        caseParseStrict,
        inclusion,
    } = population;

    const setTheStep = step => {
        setStep(step);
    };

    const classes = useLocalStyles();

    const sexOfThePopulation = summaryForSexOfThePopulation.find(
        option => option.value === sex
    )?.label;

    const caseParseStrictLabel = caseParseStrict
        ? " occurring in chronological order"
        : " regardless of which event occurred first";

    const moreThanOneCodeRecorded = period.numberOfIncludedCodes > 1;

    const PopulationDetails = () => {
        return (
            <div>
                {casesNeeded !== undefined && casesNeeded && (
                    <>
                        <div style={{ marginTop: "20px" }}>
                            <Typography variant="body1" gutterBottom>
                                {`Participants were further required to have `}
                                {moreThanOneCodeRecorded
                                    ? " a combination of the following conditions "
                                    : " the following condition "}
                                {moreThanOneCodeRecorded ? caseParseStrictLabel : " -"}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                <strong>{inclusion}</strong>
                            </Typography>
                        </div>

                        {period.numberOfIncludedCodes > 0 && (
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
                                                            {inclusionCriteriaLabelMap.get(
                                                                therapy.exposureType
                                                            )}
                                                        </strong>
                                                        {` with at least one prescription issued `}
                                                        {therapy.years !== 0 && therapy.months !== 0
                                                            ? ` every ${therapy.years} ${UNIT_OF_TIME} for a total of ${therapy.months}  times `
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
                                Patient start date
                            </Typography>
                            <Typography>
                                {
                                    "Participants would be enrolled in this study on the day they meet the above inclusion criteria."
                                }
                            </Typography>
                        </div>

                        {period.numberOfExcludedCodes > 0 && (
                            <div style={{ marginTop: "20px" }}>
                                <Typography gutterBottom variant="h6" component="div">
                                    Exclusion criteria
                                </Typography>
                                <Typography>
                                    Furthermore, participants would not be included in this study if
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
                    </>
                )}
            </div>
        );
    };

    return (
        <Card className={classes.root}>
            <CardHeader
                title="Study Population"
                className={classes.title}
                action={
                    setStep && (
                        <IconButton aria-label="edit">
                            <EditIcon onClick={() => setTheStep(1)} />
                        </IconButton>
                    )
                }
            />
            <Divider variant="middle" sx={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
            <CardContent>
                <div style={{ marginTop: "20px" }}>
                    <Typography gutterBottom variant="h6" component="div">
                        Study Quality
                    </Typography>
                    {!isNaN(addToPracticeDate1) && addToPracticeDate1 !== null && (
                        <span>
                            {`Care provider site will be eligible to participate in the study after `}
                            <strong>
                                {addToPracticeDate1} {UNIT_OF_TIME}
                            </strong>
                            {` of standardisation date.`}
                        </span>
                    )}

                    {!isNaN(addToPatientReg) && addToPatientReg !== null && (
                        <span>
                            {` Participants should be registered for at least `}
                            <strong>{` ${addToPatientReg} ${UNIT_OF_TIME} `}</strong> before
                            inclusion.
                        </span>
                    )}
                </div>

                <div style={{ marginTop: "20px" }}>
                    <Typography gutterBottom variant="h6" component="div">
                        Study population
                    </Typography>
                    {!isNaN(minAge) && minAge !== null && (
                        <span>
                            At the start of follow-up the minimum age of each participant is between
                            <strong> {minAge} years, </strong>
                        </span>
                    )}
                    {!isNaN(maxAge) && maxAge !== null && (
                        <span>
                            and
                            <strong> {maxAge} years.</strong>
                        </span>
                    )}
                    {!isNaN(maxAgeAtExit) && maxAgeAtExit !== null && (
                        <span>
                            {` Participants will be censored when they reach `}
                            <strong> {maxAgeAtExit} years of age. </strong>
                        </span>
                    )}
                    Population includes <strong> {sexOfThePopulation}.</strong>
                </div>

                <PopulationDetails />
            </CardContent>
        </Card>
    );
};

export default Population;
