import React from "react";
import unexposed from "../../../state/store/study/unexposed";
import baseline from "../../../state/store/study/baseline";
import {
    AHD_BEAN_LIST_LABEL,
    CASE_CONTROL,
    controlPracticesDropDown,
    radioOptionsControlGender,
} from "../../../constants";
import { Card, CardContent, CardHeader, Divider, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import { GetCodes } from "../../Common";
import ListItemText from "@mui/material/ListItemText";
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

const MatchSummary = ({ setStep, studyDesign }) => {
    const {
        ctrlsNeeded,
        matchCtrls,
        controlSelectionMethod,
        noOfCtrl,
        ctrlAgeRange,
        matchGender,
        withRepetition,
        canCasesBeControls,
        matchOnEthnicity,
        matchRegDate,
        ctrlReg,
        propensityScore,
    } = unexposed.data;

    const { clinicalCodeList, ahdBeanList } = baseline.data;
    const clinicalCodeListToMatch = clinicalCodeList.filter(a => a.matchingReq === true);
    const ahdBeanListToMatch = ahdBeanList.filter(a => a.matchingReq === true);

    const classes = styles();
    const setTheStep = step => {
        setStep(step);
    };

    let matchControlsSelectedNumbers = "For every exposed participant we selected";
    let matchControlsSelectedNumbersType = "unexposed participants";
    let matchCriteriaSameSex = "Exposed and unexposed participants are matched based on the";
    let matchControlspriorExposure = "Individuals in the exposed group would";

    let matchControlsExposureoutcome =
        "participate as unexposed before they encounter the exposure";
    let matchControlsbelongs =
        "Exposed and unexposed participants belong to the same ethnic category";
    let matchControlParticipantsregistered = "Exposed and unexposed participants";

    let participantBelongingTo = "The unexposed participant";
    let participantCohort = "exposed";
    let participantRepetition = "Unexposed";
    let matchingParticipant = "unexposed participants";

    if (studyDesign === CASE_CONTROL) {
        matchControlsSelectedNumbers = "For every case participant we selected";
        matchControlsSelectedNumbersType = "controls";
        matchCriteriaSameSex = "Cases and Controls are matched based on the";
        matchingParticipant = "controls";

        matchControlspriorExposure = "Individuals in the case group would";
        matchControlsExposureoutcome = "participate as controls before they encounter the outcome";
        matchControlsbelongs = "Cases and controls belong to the same ethnic category";

        matchControlParticipantsregistered = "Cases and controls";
        participantBelongingTo = "The control participant";
        participantCohort = "case";
        participantRepetition = "Controls";
    }

    return (
        <div>
            <>
                <Card className={classes.root}>
                    <CardHeader
                        title=" Matching Criteria"
                        className={classes.title}
                        action={
                            setStep && (
                                <IconButton aria-label="edit">
                                    <EditIcon onClick={() => setTheStep(4)} />
                                </IconButton>
                            )
                        }
                    />
                    <Divider variant="middle" sx={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
                    {ctrlsNeeded !== undefined &&
                    ctrlsNeeded &&
                    matchCtrls !== undefined &&
                    matchCtrls ? (
                        <CardContent>
                            <div>
                                <List sx={{ listStyle: "decimal", pl: 1, marginLeft: "20px" }}>
                                    <ListItem
                                        key="Number of controls"
                                        sx={{ display: "list-item" }}
                                    >
                                        <Typography variant="body1" gutterBottom>
                                            {`${matchControlsSelectedNumbers} `}
                                            <strong>{noOfCtrl}</strong>
                                            {` ${matchControlsSelectedNumbersType}`}
                                        </Typography>
                                    </ListItem>
                                    <ListItem key="Control age range" sx={{ display: "list-item" }}>
                                        <Typography variant="body1" gutterBottom>
                                            Age matching permitted a <strong>{ctrlAgeRange}</strong>
                                            -year variance between the groups
                                        </Typography>
                                    </ListItem>
                                    <ListItem
                                        key="Control sex matching"
                                        sx={{ display: "list-item" }}
                                    >
                                        <Typography variant="body1" gutterBottom>
                                            {`${matchCriteriaSameSex} `}
                                            <strong>
                                                {
                                                    radioOptionsControlGender.find(
                                                        a => a.value === matchGender
                                                    )?.label
                                                }
                                            </strong>
                                        </Typography>
                                    </ListItem>
                                    <ListItem
                                        key="Control practice selection"
                                        sx={{ display: "list-item" }}
                                    >
                                        <Typography variant="body1" gutterBottom>
                                            {participantBelongingTo} belong to
                                            <strong>
                                                {` ${
                                                    controlPracticesDropDown.find(
                                                        a => a.value === controlSelectionMethod
                                                    )?.label
                                                }`}
                                            </strong>
                                            {` as the corresponding ${participantCohort} participant`}
                                        </Typography>
                                    </ListItem>
                                    {matchOnEthnicity && (
                                        <ListItem
                                            key="Ethnicity matching"
                                            sx={{ display: "list-item" }}
                                        >
                                            <Typography variant="body1" gutterBottom>
                                                {matchControlsbelongs}
                                            </Typography>
                                        </ListItem>
                                    )}
                                    {matchRegDate && (
                                        <ListItem
                                            key="Registration date matching"
                                            sx={{ display: "list-item" }}
                                        >
                                            <Typography variant="body1" gutterBottom>
                                                {`${matchControlParticipantsregistered} should be
                                                registered to practice within `}
                                                <strong>{ctrlReg}</strong> days of each other
                                            </Typography>
                                        </ListItem>
                                    )}
                                    <ListItem
                                        key="Control with repetition"
                                        sx={{ display: "list-item" }}
                                    >
                                        <Typography variant="body1" gutterBottom>
                                            {`${participantRepetition} are randomly selected `}
                                            <strong>{withRepetition ? "with" : "without"}</strong>
                                            {` repetition`}
                                        </Typography>
                                    </ListItem>

                                    <ListItem key="Role reversal" sx={{ display: "list-item" }}>
                                        <Typography variant="body1" gutterBottom>
                                            {matchControlspriorExposure}
                                            <strong>{canCasesBeControls ? "" : " not"}</strong>
                                            {` ${matchControlsExposureoutcome}`}
                                        </Typography>
                                    </ListItem>

                                    {clinicalCodeListToMatch &&
                                        clinicalCodeListToMatch?.map(matchingCondition => {
                                            return (
                                                <ListItem
                                                    key={matchingCondition.label}
                                                    sx={{ display: "list-item" }}
                                                >
                                                    <ListItemText>
                                                        <Typography variant="body1" gutterBottom>
                                                            {`If the {participantCohort} participant
                                                            has `}
                                                            <strong>
                                                                {matchingCondition.filename}
                                                            </strong>
                                                            {` then, the ${matchingParticipant} should
                                                            also have the same condition recorded
                                                            between a period of `}
                                                            <strong>
                                                                {matchingCondition.months}
                                                            </strong>
                                                            {` days before or after the recording of
                                                            the ${participantCohort}
                                                            participant's event date `}
                                                            <GetCodes
                                                                rowData={matchingCondition}
                                                                type={matchingCondition.filename}
                                                            />
                                                        </Typography>
                                                    </ListItemText>
                                                </ListItem>
                                            );
                                        })}
                                    {ahdBeanListToMatch &&
                                        ahdBeanListToMatch?.map(matchingCondition => {
                                            return (
                                                <ListItem
                                                    key={matchingCondition.label}
                                                    sx={{ display: "list-item" }}
                                                >
                                                    <ListItemText>
                                                        <Typography variant="body1" gutterBottom>
                                                            {`If the ${participantCohort} participant
                                                            has `}
                                                            <strong>
                                                                {matchingCondition.label}
                                                            </strong>
                                                            {matchingCondition.userQuery !== ""
                                                                ? " with " +
                                                                  matchingCondition.userQuery
                                                                : " "}
                                                            {`then, the ${matchingParticipant} should
                                                            also have the same condition recorded
                                                            between a period of `}
                                                            <strong>
                                                                {matchingCondition.beforeDays}
                                                            </strong>
                                                            {`days before or after the recording of
                                                            the ${participantCohort} participant's event date `}
                                                            <GetCodes
                                                                rowData={matchingCondition}
                                                                type={AHD_BEAN_LIST_LABEL}
                                                            />
                                                        </Typography>
                                                    </ListItemText>
                                                </ListItem>
                                            );
                                        })}
                                </List>
                            </div>

                            {propensityScore && (
                                <div style={{ marginTop: "20px" }}>
                                    <Typography gutterBottom variant="h6" component="div">
                                        Propensity score
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        For this study we will provide results based on propensity
                                        score matching using all the indicated variables and
                                        baseline characteristics
                                    </Typography>
                                </div>
                            )}
                        </CardContent>
                    ) : (
                        <CardContent>This study does not include any matching</CardContent>
                    )}
                </Card>
            </>
        </div>
    );
};

export default MatchSummary;
