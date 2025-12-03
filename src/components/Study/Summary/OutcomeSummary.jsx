import React from "react";
import outcome from "../../../state/store/study/outcome";
import {
    AHD_BEAN_LIST_LABEL,
    CASE_CONTROL,
    FEASIBILITY,
    OUTCOME_AHD,
    OUTCOME_DRUGS,
    OUTCOME_MEDS,
    STUDY_OUTCOME_PATIENT_CENSORED,
    StudyWizardLabels,
    UNEDITABLE_FILE,
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
            <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                    Consultation information
                </Typography>
                <>
                    In this study the number of clinical consultations participants have had between
                    index date and exit date will be collected
                </>
            </CardContent>
        );
    }

    const classes = styles();

    const setTheStep = step => {
        setStep(step);
    };

    return (
        <div>
            {studyDesign === CASE_CONTROL && !countConsult ? null : (
                <Card className={classes.root}>
                    <CardHeader
                        title={title}
                        className={classes.title}
                        action={
                            setStep && (
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
                            )
                        }
                    />
                    <Divider variant="middle" sx={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
                    {hasOutcomes ? (
                        <CardContent>
                            <Typography variant="h6">{STUDY_OUTCOME_PATIENT_CENSORED}</Typography>
                            <div>
                                <List sx={{ listStyle: "decimal", pl: 1, marginLeft: "20px" }}>
                                    {clinicalCodeListForSummary.map(variable => {
                                        return (
                                            <ListItem
                                                key={variable.label}
                                                sx={{ display: "list-item" }}
                                            >
                                                <ListItemText>
                                                    <strong>{variable.filename}</strong>
                                                    {variable.excluIfOcBefIn && (
                                                        <>
                                                            <br />
                                                            {`Participants will be `}
                                                            <strong>excluded</strong> from the study
                                                            if this event occurs before index date
                                                        </>
                                                    )}
                                                    {variable.eventCounts && (
                                                        <>
                                                            <br />
                                                            <strong>
                                                                {`Event frequency count `}
                                                            </strong>
                                                            between index date and participant end
                                                            data will be extracted
                                                        </>
                                                    )}
                                                    {variable.consultCounts && (
                                                        <>
                                                            <br />
                                                            <strong>
                                                                {`Number of clinical consultations `}
                                                            </strong>
                                                            the participant had between index date
                                                            and this outcome will be collected
                                                        </>
                                                    )}
                                                    {variable.beforeDays !== 0 && (
                                                        <>
                                                            <br />
                                                            {` Should be recorded within `}
                                                            <strong>
                                                                {`${variable.beforeDays} days `}
                                                            </strong>
                                                            after index date
                                                        </>
                                                    )}
                                                    <GetCodes
                                                        rowData={variable}
                                                        type={variable.filename}
                                                    />
                                                </ListItemText>
                                            </ListItem>
                                        );
                                    })}
                                    {ahdBeanListForSummary
                                        ?.filter(ahd => ahd.incl === true)
                                        .map(ahd => {
                                            return (
                                                <ListItem
                                                    key={ahd.label}
                                                    sx={{ display: "list-item" }}
                                                >
                                                    <ListItemText>
                                                        <strong>{ahd.label}</strong>
                                                        {ahd.userQuery !== ""
                                                            ? " with " + ahd.userQuery
                                                            : ""}
                                                        {ahd.excluIfOcBefIn && (
                                                            <>
                                                                <br />
                                                                {`Participants will be `}
                                                                <strong>excluded</strong> from the
                                                                study if this event occurs before
                                                                index date
                                                            </>
                                                        )}
                                                        {ahd.eventCounts && (
                                                            <>
                                                                <br />
                                                                <strong>
                                                                    {`Event frequency count `}
                                                                </strong>
                                                                {`between index date and participant
                                                                end data will be extracted `}
                                                            </>
                                                        )}
                                                        {ahd.consultCounts && (
                                                            <>
                                                                <br />
                                                                <strong>
                                                                    {`Number of clinical consultations `}
                                                                </strong>
                                                                <strong>
                                                                    {`the participant had between
                                                                    index date and this outcome will
                                                                    be collected `}
                                                                </strong>
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

                            {countConsult && <ConsultationInformation />}
                        </CardContent>
                    ) : (
                        studyDesign !== CASE_CONTROL && (
                            <CardContent>
                                {`This study does not include any outcome variables `}
                            </CardContent>
                        )
                    )}

                    {studyDesign === CASE_CONTROL && !hasOutcomes && countConsult && (
                        <ConsultationInformation />
                    )}
                </Card>
            )}
        </div>
    );
};
export default OutcomeSummary;
