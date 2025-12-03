import React from "react";
import unexposed from "../../../state/store/study/unexposed";
import baseline from "../../../state/store/study/baseline";
import {
    CASE_CONTROL,
    controlPracticesDropDown,
    radioOptionsControlGender,
} from "../../../constants";
import { Typography } from "@mui/material";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import { GetCodes } from "../../../components/Common/index.js";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import { BasicInfoCard } from "../../Common/BasicInfoCard";

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

    const Header = () => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
            }}
        >
            <span> Matching Criteria</span>
            {setStep && (
                <IconButton aria-label="edit">
                    <EditIcon onClick={() => setTheStep(4)} />
                </IconButton>
            )}
        </div>
    );

    const Content = () => (
        <>
            {ctrlsNeeded !== undefined && ctrlsNeeded && matchCtrls !== undefined && matchCtrls ? (
                <>
                    <div>
                        <List sx={{ listStyle: "decimal", pl: 1, marginLeft: "20px" }}>
                            <ListItem key="Number of controls" sx={{ display: "list-item" }}>
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
                            <ListItem key="Control sex matching" sx={{ display: "list-item" }}>
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
                                <ListItem key="Ethnicity matching" sx={{ display: "list-item" }}>
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
                            <ListItem key="Control with repetition" sx={{ display: "list-item" }}>
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
                                                    <strong>{matchingCondition.filename}</strong>
                                                    {` then, the ${matchingParticipant} should
                                                            also have the same condition recorded
                                                            between a period of `}
                                                    <strong>{matchingCondition.months}</strong>
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
                                                    <strong>{matchingCondition.label}</strong>
                                                    {matchingCondition.userQuery !== ""
                                                        ? " with " + matchingCondition.userQuery
                                                        : " "}
                                                    {`then, the ${matchingParticipant} should
                                                            also have the same condition recorded
                                                            between a period of `}
                                                    <strong>{matchingCondition.beforeDays}</strong>
                                                    {`days before or after the recording of
                                                            the ${participantCohort} participant's event date `}
                                                    <GetCodes
                                                        rowData={matchingCondition}
                                                        type="ahdBeanList"
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
                            <Typography gutterBottom variant="h6" component="h4">
                                Propensity score
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                For this study we will provide results based on propensity score
                                matching using all the indicated variables and baseline
                                characteristics
                            </Typography>
                        </div>
                    )}
                </>
            ) : (
                <>This study does not include any matching</>
            )}
        </>
    );

    return <BasicInfoCard Header={Header} Content={Content} />;
};

export default MatchSummary;
