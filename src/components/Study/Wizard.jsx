import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Outcome } from "./Outcome";
import { Expose } from "./Expose";
import { Baseline } from "./Baseline";
import { Match } from "./Match";
import { Period } from "./Period";
import { Population } from "./Population";
import { Control } from "./Control";
import { MultipleRecords } from "./MultipleRecords";

import projectDetails from "../../state/store/projects/details";
import codes from "../../state/store/study/codes";
import period from "../../state/store/study/period";
import expose from "../../state/store/study/expose";
import unexposed from "../../state/store/study/unexposed";
import baseline from "../../state/store/study/baseline";
import outcome from "../../state/store/study/outcome";
import events from "../../lib/events";
import http from "../../lib/http";
import job from "../../state/store/study/job";
import jobStatus from "../../state/store/study/job-status";
import { v4 as uuid } from "uuid";
import { observer } from "mobx-react";
import { toJS } from "mobx";
import {
    CASE_CONTROL,
    CROSS_SECTIONAL,
    FEASIBILITY,
    INC_PREV,
    JOB_STATUS,
    PRIORITY_LABEL,
    PRIORITY_VALUE,
    StudyWizardLabels,
} from "../../constants";

import { useForm } from "react-hook-form";
import session from "../../state/store/session";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import { Grid2 as Grid, Paper, Tooltip } from "@mui/material";
import user from "../../state/store/user";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FactCheck } from "@mui/icons-material";
import PropTypes from "prop-types";
import studyDatabase from "../../state/store/study/database";
import SummaryDialog from "./Summary/SummaryDialog";
import { ShowSuccess, ShowWarning } from "../../componentsV2/Common/Toast";
import { Confirm } from "../Common";

const STAGGER_ID = uuid();
const useStyles = makeStyles(theme => ({
    modal: { display: "flex", alignItems: "center", justifyContent: "center" },
    paper: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        zIndex: "inherit",
    },
    root: { width: "100%" },
    button: { marginRight: theme.spacing(1) },
    instructions: { marginTop: theme.spacing(1), marginBottom: theme.spacing(1) },
    drawerPaper: { width: "650px", padding: "0px" },
}));

const theme = createTheme({
    components: {
        MuiTooltip: { styleOverrides: { tooltip: { color: "red", backgroundColor: "#f2f2f2" } } },
    },
});

function getSteps(studyDesign) {
    if (studyDesign === CROSS_SECTIONAL || studyDesign === INC_PREV) {
        return [
            StudyWizardLabels.STUDY_DESIGN,
            StudyWizardLabels.STUDY_POPULATION,
            StudyWizardLabels.BASELINE_FOR_INC_PREV_AND_CROSS_SEC_AND_SUBMIT,
        ];
    } else if (studyDesign === CASE_CONTROL) {
        return [
            StudyWizardLabels.STUDY_DESIGN,
            StudyWizardLabels.STUDY_POPULATION,
            StudyWizardLabels.EXPOSED_FOR_CASE_CONTROL,
            StudyWizardLabels.UNEXPOSED_FOR_CASE_CONTROL,
            StudyWizardLabels.MATCH,
            StudyWizardLabels.BASELINE_FOR_CASE_CONTROL,
            StudyWizardLabels.SUBMIT,
        ];
    } else if (studyDesign === FEASIBILITY) {
        return [
            StudyWizardLabels.STUDY_DESIGN,
            StudyWizardLabels.STUDY_POPULATION,
            StudyWizardLabels.EXPOSED,
            StudyWizardLabels.BASELINE,
            StudyWizardLabels.OUTCOME_AND_SUBMIT,
        ];
    }
    // Then its a Cohort Study
    else {
        return [
            StudyWizardLabels.STUDY_DESIGN,
            StudyWizardLabels.STUDY_POPULATION,
            StudyWizardLabels.EXPOSED,
            StudyWizardLabels.UNEXPOSED,
            StudyWizardLabels.MATCH,
            StudyWizardLabels.BASELINE,
            StudyWizardLabels.OUTCOME_AND_SUBMIT,
        ];
    }
}

function getStepsWithMultipleRecords(studyDesign) {
    if (studyDesign === CROSS_SECTIONAL) {
        return [
            StudyWizardLabels.STUDY_DESIGN,
            StudyWizardLabels.STUDY_POPULATION,
            StudyWizardLabels.BASELINE_FOR_INC_PREV_AND_CROSS_SEC,
            StudyWizardLabels.MULTIPLE_RECORDS_AND_SUBMIT,
        ];
    } else if (studyDesign === INC_PREV) {
        return [
            StudyWizardLabels.STUDY_DESIGN,
            StudyWizardLabels.STUDY_POPULATION,
            StudyWizardLabels.BASELINE_FOR_INC_PREV_AND_CROSS_SEC,
            StudyWizardLabels.MULTIPLE_RECORDS_AND_SUBMIT,
        ];
    } else if (studyDesign === CASE_CONTROL) {
        return [
            StudyWizardLabels.STUDY_DESIGN,
            StudyWizardLabels.STUDY_POPULATION,
            StudyWizardLabels.EXPOSED_FOR_CASE_CONTROL,
            StudyWizardLabels.UNEXPOSED_FOR_CASE_CONTROL,
            StudyWizardLabels.MATCH,
            StudyWizardLabels.BASELINE_FOR_CASE_CONTROL,
            StudyWizardLabels.MULTIPLE_RECORDS,
            StudyWizardLabels.SUBMIT,
        ];
    } else if (studyDesign === FEASIBILITY) {
        return [
            StudyWizardLabels.STUDY_DESIGN,
            StudyWizardLabels.STUDY_POPULATION,
            StudyWizardLabels.EXPOSED,
            StudyWizardLabels.BASELINE,
            StudyWizardLabels.MULTIPLE_RECORDS,
            StudyWizardLabels.OUTCOME_AND_SUBMIT,
        ];
    }
    // Then its a Cohort Study
    else {
        return [
            StudyWizardLabels.STUDY_DESIGN,
            StudyWizardLabels.STUDY_POPULATION,
            StudyWizardLabels.EXPOSED,
            StudyWizardLabels.UNEXPOSED,
            StudyWizardLabels.MATCH,
            StudyWizardLabels.BASELINE,
            StudyWizardLabels.MULTIPLE_RECORDS,
            StudyWizardLabels.OUTCOME_AND_SUBMIT,
        ];
    }
}

function getStepContentWithoutControlAndMatchButIncludeBaseline(step, props) {
    switch (step) {
        case 0:
            return periodComponent(props);
        case 1:
            return populationComponent(props);
        case 2:
            return exposeComponent(props);
        case 3:
            return baselineComponent(props);
        case 4:
            return outcomeComponent(props);

        default:
            return "Unknown step";
    }
}

function getStepContentWithoutControlAndMatch(step, props) {
    switch (step) {
        case 0:
            return periodComponent(props);
        case 1:
            return populationComponent(props);
        case 2:
            return baselineComponent(props);
        case 3:
            return outcomeComponent(props);

        default:
            return "Unknown step";
    }
}

function variablesAdded() {
    return expose.hasCodes || unexposed.hasCodes || baseline.hasCodes || outcome.hasCodes;
}

function periodComponent(props) {
    return <Period period={period} codes={codes} cannotChangeDB={variablesAdded()} {...props} />;
}

function populationComponent(props) {
    return <Population period={period} codes={codes} {...props} />;
}

function exposeComponent(props) {
    return <Expose {...props} expose={expose} codes={codes} />;
}

function controlComponent(props) {
    return (
        <Control
            {...props}
            unexposed={unexposed}
            codes={codes}
            expose={expose}
            studyHasExposure={expose.data.casesNeeded}
        />
    );
}

function matchComponent(props) {
    return (
        <Match
            {...props}
            codes={codes}
            baseline={baseline}
            // match={match}
            studyHasExposure={expose.data.casesNeeded}
            studyHasControl={unexposed.data.ctrlsNeeded}
            unexposed={unexposed}
        />
    );
}

function baselineComponent(props) {
    return (
        <Baseline {...props} baseline={baseline} codes={codes} design={period.data?.studyDesign} />
    );
}

function outcomeComponent(props) {
    return (
        <Outcome
            {...props}
            outcome={outcome}
            design={period.data?.studyDesign}
            opFilename={period.data?.opFilename}
            codes={codes}
        />
    );
}

function getAllStepContents(step, props) {
    switch (step) {
        case 0:
            return periodComponent(props);
        case 1:
            return populationComponent(props);
        case 2:
            return exposeComponent(props);
        case 3:
            return controlComponent(props);
        case 4:
            return matchComponent(props);
        case 5:
            return baselineComponent(props);
        case 6:
            return outcomeComponent(props);

        default:
            return "Unknown step";
    }
}

function getStepContent(step, props, studyDesign) {
    if (studyDesign === FEASIBILITY) {
        return getStepContentWithoutControlAndMatchButIncludeBaseline(step, props);
    }
    return [CROSS_SECTIONAL, INC_PREV].includes(studyDesign)
        ? getStepContentWithoutControlAndMatch(step, props)
        : getAllStepContents(step, props);
}

function getStepContentsForMultipleRecords(step, props) {
    switch (step) {
        case 0:
            return periodComponent(props);
        case 1:
            return populationComponent(props);
        case 2:
            return exposeComponent(props);
        case 3:
            return controlComponent(props);
        case 4:
            return matchComponent(props);
        case 5:
            return baselineComponent(props);
        case 6:
            return <MultipleRecords {...props} baseline={baseline} codes={codes} />;
        case 7:
            return outcomeComponent(props);

        default:
            return "Unknown step";
    }
}

function getStepContentForMultipleRecordsWithExposedAndWithoutControlAndMatch(step, props) {
    switch (step) {
        case 0:
            return periodComponent(props);
        case 1:
            return populationComponent(props);
        case 2:
            return exposeComponent(props);
        case 3:
            return baselineComponent(props);
        case 4:
            return <MultipleRecords {...props} baseline={baseline} codes={codes} />;
        case 5:
            return outcomeComponent(props);

        default:
            return "Unknown step";
    }
}

function getStepContentForMultipleRecordsWithoutControlAndMatch(step, props) {
    switch (step) {
        case 0:
            return periodComponent(props);
        case 1:
            return populationComponent(props);
        case 2:
            return baselineComponent(props);
        case 3:
            return <MultipleRecords {...props} baseline={baseline} codes={codes} />;

        default:
            return "Unknown step";
    }
}

function getStepContentWithMultipleRecords(step, props, studyDesign) {
    if (studyDesign === FEASIBILITY) {
        return getStepContentForMultipleRecordsWithExposedAndWithoutControlAndMatch(step, props);
    }
    return [CROSS_SECTIONAL, INC_PREV].includes(studyDesign)
        ? getStepContentForMultipleRecordsWithoutControlAndMatch(step, props)
        : getStepContentsForMultipleRecords(step, props);
}
const NavigationButtons = ({
    activeStep,
    /*errors,*/
    handleBack,
    handleSaveDraft,
    classes,
    steps,
    margin,
    message,
    setSubmitEnable,
    submitEnabled,
    selectedDb,
    ...rest
}) => {
    const enableSubmit = async () => {
        setSubmitEnable(true);
    };

    const disableSubmit = () => {
        setSubmitEnable(false);
    };

    React.useEffect(() => {
        events.on("job.enable", enableSubmit);
        events.on("job.disable", disableSubmit);
        //TODO: Create a return function to clean up registered events.
    }, []);

    let backButtonContent = activeStep === 0 ? "Back to project" : "Back";
    const lastStep = activeStep === steps.length - 1;

    let content = lastStep ? "Finish" : "Next";

    if ((!submitEnabled || !selectedDb?.submission) && lastStep) {
        content = "Admin Disabled";
    }

    const deletedProject = lastStep && !projectDetails.activeProject;

    const { toggleDrawer } = rest;

    const isSaveAndExitButtonDissabled =
        !submitEnabled ||
        !selectedDb?.submission ||
        deletedProject ||
        (!lastStep && !projectDetails.isDatabaseMapped) ||
        activeStep <= 1;

    const showErrorForSaveAndExitButtonDissabled = isSaveAndExitButtonDissabled && activeStep > 1;

    return (
        <div style={margin}>
            <Grid container spacing={2} direction="row">
                <Grid size={4}>
                    <Button variant="outlined" onClick={handleBack} className={classes.button}>
                        {backButtonContent}
                    </Button>
                </Grid>
                <Grid
                    style={{ alignItems: "center", justifyContent: "flex-end", display: "flex" }}
                    size={8}
                >
                    {lastStep && (
                        <div style={{ marginRight: "15px" }}>
                            View Summary:
                            <IconButton
                                aria-label="summary"
                                size="large"
                                onClick={() => toggleDrawer(true)}
                            >
                                <FactCheck />
                            </IconButton>
                        </div>
                    )}
                    {activeStep > 1 && (
                        <Tooltip
                            title={
                                "Save as draft and exit. \n Note: Drafts over 90 days will be automatically deleted."
                            }
                        >
                            <Button
                                variant="contained"
                                onClick={handleSaveDraft}
                                className={classes.button}
                                disabled={isSaveAndExitButtonDissabled}
                            >
                                Save and Exit
                            </Button>
                        </Tooltip>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        disabled={
                            ((!submitEnabled || !selectedDb?.submission) && lastStep) ||
                            deletedProject ||
                            (!lastStep && !projectDetails.isDatabaseMapped)
                        }
                    >
                        {content}
                    </Button>
                    {(((!submitEnabled || !selectedDb?.submission) && lastStep) ||
                        showErrorForSaveAndExitButtonDissabled) && (
                        <>
                            <ThemeProvider theme={theme}>
                                <Tooltip
                                    title={
                                        <div
                                            style={{
                                                whiteSpace: "pre-wrap",
                                                maxHeight: "500px",
                                                overflow: "auto",
                                            }}
                                        >
                                            {message}
                                        </div>
                                    }
                                    placement="bottom"
                                    aria-label="cannot submit job"
                                >
                                    <IconButton
                                        sx={{ color: "red" }}
                                        aria-label={message}
                                        size="large"
                                    >
                                        <InfoIcon />
                                    </IconButton>
                                </Tooltip>
                            </ThemeProvider>
                        </>
                    )}
                </Grid>
            </Grid>
        </div>
    );
};

function removeAdditionalFields(store, hasUniqueKey) {
    if (hasUniqueKey) {
        // Only Baseline and Outcome
        (store.clinicalCodeList || []).forEach(element => {
            if (element.uniqueKey) {
                delete element.uniqueKey;
            }
            if (element.id) {
                delete element.id;
            }
        });

        (store.ahdBeanList || []).forEach(element => {
            if (element.uniqueKey) {
                delete element.uniqueKey;
            }
            if (element.id) {
                delete element.id;
            }
        });
    } else {
        // expose, unexposed
        (store.ahdBeanList || []).forEach(element => {
            if (element.id) {
                delete element.id;
            }
        });
        (store.clinicalCodeListTherapy || []).forEach(element => {
            if (element.id) {
                delete element.id;
            }
        });
        (store.clinicalCodeListMedical || []).forEach(element => {
            if (element.id) {
                delete element.id;
            }
        });
    }
}

export function cleanUp(period, expose, unexposed, baseline, outcome) {
    delete period.studyID; // stores jobID
    delete expose.studyID;

    delete unexposed.studyID;
    delete baseline.studyID;
    delete outcome.studyID;

    removeAdditionalFields(expose, false);
    removeAdditionalFields(unexposed, false);
    removeAdditionalFields(baseline, true);
    removeAdditionalFields(outcome, true);
}

//#region - Main
export const LoadWizard = observer(incomingProps => {
    //TODO: Remove the below UseForm Dependency.
    const { handleSubmit, register, errors, getValues } = useForm();
    // const history = useHistory();
    const {
        /*id,*/
        // setDisplayNewStudy,
        mode,
        studyDesign,
        projectID,
        setStudyID,
        jobUUID,
    } = incomingProps;

    const classes = useStyles();
    const [activeStep, setActiveStep] = React.useState(0);
    const [skipped, setSkipped] = React.useState(new Set());
    const [selectedDb, setSelectedDb] = React.useState({});
    const [submitEnabled, setSubmitEnable] = React.useState(true);
    const [openSummaryDialog, setOpenSummaryDialog] = React.useState(false);

    const toggleDrawer = () => {
        setOpenSummaryDialog(!openSummaryDialog);
    };

    const setActiveStepFromSummary = step => {
        setOpenSummaryDialog(false);
        setActiveStep(step);
    };

    const steps =
        mode === "modify" ? getStepsWithMultipleRecords(studyDesign) : getSteps(studyDesign);

    async function saveJob(isDraft = false) {
        expose.finalInclusion = expose.getFinalIncludes();
        unexposed.finalExclusion = unexposed.getFinalExcludes();

        const studyPeriodJS = toJS(period.data);
        const exposeJS = toJS(expose.data);
        const unexposedJS = toJS(unexposed.data);
        const baselineJS = toJS(baseline.data);
        const outcomeJS = toJS(outcome.data);
        const databaseJS = toJS(studyDatabase.data);

        cleanUp(studyPeriodJS, exposeJS, unexposedJS, baselineJS, outcomeJS);

        const output = {
            studyPeriod: studyPeriodJS,
            exposed: exposeJS,
            control: unexposedJS,
            baseline: baselineJS,
            outcome: outcomeJS,
            dataSource: databaseJS,
        };

        const request = {
            id: jobUUID,
            jobId: job?.data?.jobID,
            userID: session.loggedInUser,
            studyName: studyPeriodJS.opFilename,
            status: isDraft ? JOB_STATUS.DRAFT : JOB_STATUS.QUEUE,
            studyObject: output,
            priority: PRIORITY_VALUE[PRIORITY_LABEL.NORMAL],
            projectID,
        };

        if (mode === "modify") {
            if (!job?.data?.jobID) throw new Error("Job/Addon Job not found");
            // AddOns
            request.parentJobID = job.data.parentJobID ? job.data.parentJobID : job.data.JobID;
            return await http.post(`projects/${projectID}/addons`, request).stagger(STAGGER_ID);
        } else {
            // Job
            return await http.post(`projects/${projectID}/jobs`, request).stagger(STAGGER_ID);
        }
    }

    React.useEffect(() => {
        if (activeStep === -1) {
            setStudyID(undefined);
        }
    }, [activeStep, setStudyID]);

    React.useEffect(() => {
        (async () => {
            await jobStatus.checkStatus();
            if (jobStatus.status !== "true") {
                events.emit("job.disable");
            }
        })();
    }, []);

    React.useEffect(() => {
        const selectedDb = studyDatabase.dbDetails(studyDatabase.data?.id);
        setSelectedDb(selectedDb);

        if (selectedDb?.name === undefined) {
            (async () => {
                studyDatabase.data?.id &&
                    (await user.getInactiveDatabaseNameForStudy(studyDatabase.data?.id));
            })();
        }

        setSubmitEnable(jobStatus.status === "true");
    }, [studyDatabase.data?.id]);

    let message = "";

    if (!submitEnabled) {
        message =
            "You cannot submit data extraction right now. The database may not be available or Dexter might be down.";
    } else if (user.inactiveDb !== "") {
        message = `Database ${user.inactiveDb} is not active. You will not be able to submit this study.`;
    } else if (selectedDb !== undefined && !selectedDb?.submission) {
        activeStep === steps.length - 1
            ? (message = `Admin has disabled submission for ${selectedDb?.name}. You will not be able to submit this study.`)
            : (message = `Admin has disabled submission for ${selectedDb?.name}. You can proceed but you will not be able to submit this study`);
    }

    const isStepOptional = (/*step*/) => {
        return false;
    };

    const isStepSkipped = step => {
        return skipped.has(step);
    };

    const validateQuery = (finalArray, query) => {
        const VALIDATEQUERY = finalArray.length > 1;

        if (!VALIDATEQUERY) {
            return true;
        }

        for (let index = 0; index < finalArray.length; index++) {
            const element = finalArray[index];
            if (query.indexOf(element) === -1) {
                ShowWarning("Please verify if you have combined all the variables correctly");
                return false;
            }
        }
        return true;
    };

    const performValidations = () => {
        const steps =
            mode === "modify" ? getStepsWithMultipleRecords(studyDesign) : getSteps(studyDesign);

        if (steps[activeStep] === StudyWizardLabels.STUDY_POPULATION) {
            if (period.data.population.casesNeeded) {
                if (!period.hasIncludedCodes) {
                    ShowWarning("Please add at least one inclusion criteria to proceed");
                    return false;
                } else {
                    if (period.data.population?.finalInclusion?.length === 1) {
                        period.set("inclusion", `(${period.data.population.finalInclusion})`);
                    }
                    return validateQuery(
                        period.data.population.finalInclusion,
                        period.data.population.inclusion
                    );
                }
            }
        }

        if (
            [
                StudyWizardLabels.EXPOSED,
                StudyWizardLabels.EXPOSED_FOR_CASE_CONTROL,
                StudyWizardLabels.EXPOSED_FOR_INC_PREV_AND_CROSS_SEC,
            ].includes(steps[activeStep])
        ) {
            // Validate if there included code are present in Query,
            // If not present, alert user to add those codes and do not proceed to next step.
            if (expose.data.casesNeeded) {
                if (!expose.hasIncludedCodes) {
                    ShowWarning("Please add at least one inclusion criteria to proceed");
                    return false;
                } else {
                    if (expose.data.finalInclusion?.length === 1) {
                        expose.set("inclusion", `(${expose.data.finalInclusion})`);
                    }
                    return validateQuery(expose.data.finalInclusion, expose.data.inclusion);
                }
            }
        }
        if (
            [StudyWizardLabels.UNEXPOSED, StudyWizardLabels.UNEXPOSED_FOR_CASE_CONTROL].includes(
                steps[activeStep]
            )
        ) {
            if (unexposed.data.finalExclusion?.length === 1) {
                unexposed.set("exclusion", `(${unexposed.data.finalExclusion})`);
            }
            return validateQuery(unexposed.data.finalExclusion, unexposed.data.exclusion);
        }
        return true;
    };

    const handleNext = async () => {
        // Generic Validator, Will take the steps dynamically.
        if (!performValidations()) {
            return;
        }

        const lastStep = activeStep === steps.length - 1;

        if (lastStep) {
            const { isConfirmed } = await Confirm(
                "Job Submission",
                "Are you sure you want to submit?"
            );

            if (!isConfirmed) {
                return;
            }

            const result = await saveJob();
            if (result) {
                ShowSuccess("Job Saved Successfully");

                events.emit("reset.period"); // This is to ensure a old store values are reset in the study Store.
                events.emit("reset.expose");
                events.emit("reset.unexposed");
                events.emit("reset.baseline");
                events.emit("reset.records");
                events.emit("reset.outcome");
                events.emit("reset.job");
                setStudyID(undefined);
            }

            //Prepare Data to be sent to the backend.

            // Make API Call
        }

        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }

        const isDatabaseSelected =
            studyDatabase.data?.id !== undefined && studyDatabase.data?.id?.toString() !== "";

        if (activeStep === 0 && !isDatabaseSelected) {
            ShowWarning("Kindly select a database to proceed further");
        } else {
            setActiveStep(prevActiveStep => prevActiveStep + 1);
        }
        setSkipped(newSkipped);
    };

    const handleSaveDraft = async () => {
        // Generic Validator, Will take the steps dynamically.
        if (!performValidations()) {
            return;
        }
        const { isConfirmed } = await Confirm(
            "Save as Draft",
            "Are you sure you want to save this as a draft?"
        );

        if (!isConfirmed) {
            return;
        }

        const result = await saveJob(true);
        if (result) {
            ShowSuccess("Job Saved as Draft Successfully");

            events.emit("reset.period"); // This is to ensure a old store values are reset in the study Store.
            events.emit("reset.expose");
            events.emit("reset.unexposed");
            events.emit("reset.baseline");
            events.emit("reset.records");
            events.emit("reset.outcome");
            events.emit("reset.job");
            setStudyID(undefined);
        }
    };

    const handleBack = async () => {
        if (activeStep === 0) {
            const { isConfirmed } = await Confirm(
                "Back to Projects",
                "Are you sure you want to go back?"
            );

            if (!isConfirmed) {
                return;
            }
            events.emit("reset.period"); // This is to ensure a old store values are reset in the study Store.
            events.emit("reset.expose");
            events.emit("reset.unexposed");
            events.emit("reset.baseline");
            events.emit("reset.records");
            events.emit("reset.outcome");
            events.emit("reset.job");
            setStudyID(undefined);
        }
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const props = {
        ...incomingProps,
        register,
        errors,
        handleNext,
        activeStep,
        handleBack,
        handleSaveDraft,
        steps,
        getValues,
        message,
        submitEnabled,
    };

    const NavigationProps = {
        activeStep,
        errors,
        handleBack,
        handleSaveDraft,
        classes,
        steps,
        setSelectedDb,
        message,
        setSubmitEnable,
        submitEnabled,
        open: openSummaryDialog,
        toggleDrawer,
        selectedDb,
    };

    return (
        <div className={classes.root} style={{ marginTop: "10px" }}>
            <form onSubmit={handleSubmit(handleNext)}>
                <Paper style={{ padding: "12px" }}>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label, index) => {
                            const stepProps = {};
                            const labelProps = {};
                            if (isStepOptional(index)) {
                                labelProps.optional = (
                                    <Typography variant="caption">Optional</Typography>
                                );
                            }
                            if (isStepSkipped(index)) {
                                stepProps.completed = false;
                            }
                            return (
                                <Step key={label} {...stepProps}>
                                    <StepLabel {...labelProps}>{label}</StepLabel>
                                </Step>
                            );
                        })}
                    </Stepper>
                </Paper>
                <div>
                    <NavigationButtons
                        {...NavigationProps}
                        margin={{ marginBottom: "10px", marginTop: "10px" }}
                    />
                    {activeStep === steps.length ? (
                        <div>
                            <Typography className={classes.instructions}>
                                All steps completed - you&apos;re finished
                            </Typography>
                            <Button onClick={handleReset} className={classes.button}>
                                Reset
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <Typography component={"span"} className={classes.instructions}>
                                {mode === "modify"
                                    ? getStepContentWithMultipleRecords(
                                          activeStep,
                                          props,
                                          studyDesign
                                      )
                                    : getStepContent(activeStep, props, studyDesign)}
                            </Typography>
                            <div>
                                <NavigationButtons
                                    {...NavigationProps}
                                    margin={{ marginTop: "10px", marginBottom: "10px" }}
                                    showSummary={true}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <SummaryDialog
                    open={openSummaryDialog}
                    toggleDrawer={toggleDrawer}
                    setActiveStepFromSummary={setActiveStepFromSummary}
                />
            </form>
        </div>
    );
});

NavigationButtons.propTypes = {
    activeStep: PropTypes.number,
    handleBack: PropTypes.func,
    handleSaveDraft: PropTypes.func,
    classes: PropTypes.object,
    steps: PropTypes.array,
    setSubmitEnable: PropTypes.func,
    message: PropTypes.string,
    submitEnabled: PropTypes.bool,
    margin: PropTypes.object,
};

//#endregion
