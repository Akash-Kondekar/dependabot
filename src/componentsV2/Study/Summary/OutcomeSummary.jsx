import React from "react";
import outcome from "../../../state/store/study/outcome";
import {
    CASE_CONTROL,
    FEASIBILITY,
    OUTCOME_AHD,
    OUTCOME_DRUGS,
    OUTCOME_MEDS,
    STUDY_OUTCOME_PATIENT_CENSORED,
    StudyWizardLabels,
    UNEDITABLE_FILE,
} from "../../../constants";
import { Typography } from "@mui/material";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import { GetCodes } from "../../../components/Common/index.js";
import { BasicInfoCard } from "../../Common/BasicInfoCard";

const OutcomeSummary = ({ setStep, studyDesign, addon }) => {
    const { clinicalCodeList, ahdBeanList, countConsult } = outcome.data;
    const clinicalCodeListForSummary = clinicalCodeList.filter(
        a =>
            a.matchingReq === false &&
            a.exposureType !== UNEDITABLE_FILE &&
            a.incl === true &&
            [OUTCOME_MEDS, OUTCOME_DRUGS].includes(a.fileType)
    );
    const ahdBeanListForSummary = ahdBeanList.filter(
        a =>
            a.matchingReq === false &&
            a.exposureType !== UNEDITABLE_FILE &&
            a.incl === true &&
            a.fileType === OUTCOME_AHD
    );

    const hasOutcomes =
        (clinicalCodeListForSummary !== undefined && clinicalCodeListForSummary.length > 0) ||
        (ahdBeanListForSummary !== undefined && ahdBeanListForSummary.length > 0);

    const title = studyDesign === CASE_CONTROL ? "Others" : StudyWizardLabels.OUTCOME;

    function ConsultationInformation() {
        return (
            <>
                <Typography gutterBottom variant="h6" component="h4">
                    Consultation information
                </Typography>
                <>
                    In this study the number of clinical consultations participants have had between
                    index date and exit date will be collected
                </>
            </>
        );
    }

    const setTheStep = step => {
        setStep(step);
    };

    const Header = () => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
            }}
        >
            <span>{title}</span>
            {setStep && (
                <IconButton aria-label="edit">
                    <EditIcon
                        onClick={() => {
                            if (studyDesign === FEASIBILITY) {
                                if (addon) {
                                    setStep(5);
                                } else {
                                    setStep(4);
                                }
                                return;
                            }
                            addon ? setTheStep(7) : setTheStep(6);
                        }}
                    />
                </IconButton>
            )}
        </div>
    );

    const Content = () => (
        <>
            {hasOutcomes ? (
                <>
                    <Typography variant="h6" component="h4">
                        {STUDY_OUTCOME_PATIENT_CENSORED}
                    </Typography>
                    <div>
                        <List sx={{ listStyle: "decimal", pl: 1, marginLeft: "20px" }}>
                            {clinicalCodeListForSummary.map(variable => {
                                return (
                                    <ListItem key={variable.label} sx={{ display: "list-item" }}>
                                        <ListItemText>
                                            <strong>{variable.filename}</strong>
                                            {variable.excluIfOcBefIn && (
                                                <>
                                                    <br />
                                                    {`Participants will be `}
                                                    <strong>excluded</strong> from the study if this
                                                    event occurs before index date
                                                </>
                                            )}
                                            {variable.eventCounts && (
                                                <>
                                                    <br />
                                                    <strong>{`Event frequency count `}</strong>
                                                    between index date and participant end data will
                                                    be extracted
                                                </>
                                            )}
                                            {variable.consultCounts && (
                                                <>
                                                    <br />
                                                    <strong>
                                                        {`Number of clinical consultations `}
                                                    </strong>
                                                    the participant had between index date and this
                                                    outcome will be collected
                                                </>
                                            )}
                                            {variable.beforeDays !== 0 && (
                                                <>
                                                    <br />
                                                    {` Should be recorded within `}
                                                    <strong>{`${variable.beforeDays} days `}</strong>
                                                    after index date
                                                </>
                                            )}
                                            <GetCodes rowData={variable} type={variable.filename} />
                                        </ListItemText>
                                    </ListItem>
                                );
                            })}
                            {ahdBeanListForSummary
                                ?.filter(ahd => ahd.incl === true)
                                .map(ahd => {
                                    return (
                                        <ListItem key={ahd.label} sx={{ display: "list-item" }}>
                                            <ListItemText>
                                                <strong>{ahd.label}</strong>
                                                {ahd.userQuery !== ""
                                                    ? " with " + ahd.userQuery
                                                    : ""}
                                                {ahd.excluIfOcBefIn && (
                                                    <>
                                                        <br />
                                                        {`Participants will be `}
                                                        <strong>excluded</strong> from the study if
                                                        this event occurs before index date
                                                    </>
                                                )}
                                                {ahd.eventCounts && (
                                                    <>
                                                        <br />
                                                        <strong>{`Event frequency count `}</strong>
                                                        {`between index date and participant end data will be extracted `}
                                                    </>
                                                )}
                                                {ahd.consultCounts && (
                                                    <>
                                                        <br />
                                                        <strong>
                                                            {`Number of clinical consultations `}
                                                        </strong>
                                                        <strong>
                                                            {`the participant had between index date and this outcome will be collected `}
                                                        </strong>
                                                    </>
                                                )}

                                                <GetCodes rowData={ahd} type={"ahdBeanList"} />
                                            </ListItemText>
                                        </ListItem>
                                    );
                                })}
                        </List>
                    </div>

                    {countConsult && <ConsultationInformation />}
                </>
            ) : (
                studyDesign !== CASE_CONTROL && (
                    <>{`This study does not include any outcome variables `}</>
                )
            )}

            {studyDesign === CASE_CONTROL && !hasOutcomes && countConsult && (
                <ConsultationInformation />
            )}
        </>
    );

    return (
        <div>
            {studyDesign === CASE_CONTROL && !countConsult ? null : (
                <BasicInfoCard Header={Header} Content={Content} />
            )}
        </div>
    );
};
export default OutcomeSummary;
