import React from "react";
import { observer } from "mobx-react";
import { CardHeader, Dropdown, Input, Radiogroup, Row } from "../Common";
import { Grid2 as Grid, Paper } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useStyles } from "../useStyles";
import CssBaseline from "@mui/material/CssBaseline";
import enLocale from "date-fns/locale/en-GB";

import { CROSS_SECTIONAL, radioOptionsDatabaseTypes, STUDY_NAME } from "../../constants";

import job from "../../state/store/study/job";
import session from "../../state/store/session";
import Typography from "@mui/material/Typography";
import projectDetails from "../../state/store/projects/details";
import studyDatabase from "../../state/store/study/database";
import { formatDate } from "../../utils";

const SelectDatabase = observer(
    ({ period, codes, mode, cannotChangeDB, responseHasCodes, message, submitEnabled }) => {
        const { practiceOption } = period.data;
        const disabled = mode === "modify";
        const [currentDb, setCurrentDb] = React.useState({});

        React.useEffect(() => {
            (async () => {
                const selectedDb = studyDatabase.dbDetails(studyDatabase.data?.id);
                setCurrentDb(selectedDb);
                studyDatabase.data?.id && (await codes.load(selectedDb?.name));
            })();
        }, [studyDatabase.data, codes]);

        const isUser = session.isUser;
        const title = "Choose Database";

        const DatabaseNotAvailable = () => {
            return (
                <Typography variant={"h6"} style={{ color: "red" }}>
                    {message}
                </Typography>
            );
        };

        const NoDatabasesAssigned = () => {
            return (
                <Typography variant={"h6"} style={{ color: "red" }}>
                    You do not have any databases assigned. Please contact the administrator.
                </Typography>
            );
        };

        const inactiveDatabase =
            studyDatabase.data?.id &&
            studyDatabase.data?.id?.toString() !== "" &&
            currentDb?.name === undefined;
        const databaseNotAvailable =
            currentDb?.submission === false || !submitEnabled || inactiveDatabase;
        const readOnly =
            cannotChangeDB ||
            responseHasCodes ||
            !projectDetails.isDatabaseMapped ||
            inactiveDatabase;

        const handleDbSelection = value => {
            const result = studyDatabase.dbDetails(value);

            const dbVersion = result?.version !== undefined ? result.version : "";

            const database = {
                id: value,
                name: result?.name,
                version: dbVersion,
            };

            studyDatabase.setData(database);
            period.setValue("dbName", value);
        };

        return (
            <>
                <CardHeader title={title} />
                <Dropdown
                    ddLabel="Select Database"
                    labelName="database"
                    labelValue="Select Database"
                    value={
                        !inactiveDatabase && studyDatabase.data?.id !== undefined
                            ? studyDatabase.data?.id
                            : ""
                    }
                    handleChange={e => handleDbSelection(e.target.value)}
                    dropdownOptions={studyDatabase.listOfEligibleDatabases}
                    disabled={mode === "modify" ? true : !!readOnly}
                />
                {databaseNotAvailable && <DatabaseNotAvailable />}
                {!projectDetails.isDatabaseMapped && <NoDatabasesAssigned />}
                {!isUser && (
                    <Grid container>
                        <Grid container size={12}>
                            <Grid style={{ alignSelf: "center" }} size={6}>
                                <Radiogroup
                                    value={practiceOption === undefined ? 2 : practiceOption}
                                    handleChange={e => {
                                        period.setValue("practiceOption", parseInt(e.target.value));
                                    }}
                                    radioOptions={radioOptionsDatabaseTypes}
                                    disabled={disabled}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                )}
            </>
        );
    }
);

const StudyDuration = observer(({ period, mode, studyDesign }) => {
    const { studyStart, studyEnd } = period.data;

    const getMinEndDate = () => {
        if (studyStart && isValidDate(new Date(studyStart))) {
            return new Date(studyStart);
        }
        return null;
    };

    function isValidDate(d) {
        return d instanceof Date && !isNaN(d);
    }

    const handleStartDateChange = date => {
        if (isValidDate(date)) {
            const tempDate = formatDate(date, "yyyy-MM-dd");
            period.setValue("studyStart", tempDate);

            if (studyDesign === CROSS_SECTIONAL) {
                period.setValue("studyEnd", period.getNextDate(tempDate));
            }
        }
    };

    const handleEndDateChange = date => {
        if (isValidDate(date)) {
            const tempDate = formatDate(date, "yyyy-MM-dd");
            period.setValue("studyEnd", tempDate);
        }
    };

    return (
        <>
            <Typography component={"span"} variant="h6" style={{ marginBottom: "10px" }}>
                Study Period
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enLocale}>
                <Grid container>
                    <Grid container spacing={3} size={12}>
                        <Grid>
                            <DatePicker
                                label="Study Start Date"
                                value={studyStart ? new Date(studyStart) : null}
                                onChange={handleStartDateChange}
                                disabled={mode === "modify"}
                                slotProps={{
                                    textField: {
                                        variant: "outlined",
                                        size: "medium",
                                        fullWidth: true,
                                        "aria-label": "Study Start Date",
                                    },
                                }}
                            />
                        </Grid>

                        {studyDesign !== CROSS_SECTIONAL && (
                            <Grid>
                                <DatePicker
                                    label="Study End Date"
                                    value={studyEnd ? new Date(studyEnd) : null}
                                    onChange={handleEndDateChange}
                                    disabled={mode === "modify"}
                                    minDate={getMinEndDate()}
                                    slotProps={{
                                        textField: {
                                            variant: "outlined",
                                            size: "medium",
                                            fullWidth: true,
                                            "aria-label": "Study End Date",
                                        },
                                    }}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </LocalizationProvider>
        </>
    );
});

const ProjectAndOutput = observer(({ period, mode }) => {
    return (
        <>
            <CardHeader title={STUDY_NAME} />
            <div style={{ marginLeft: "10px", width: "90%" }}>
                <Row label="Provide a name for this study" required={true}>
                    <Input
                        name="Study Name"
                        value={period.data.opFilename}
                        onChange={e => {
                            period.setValue("opFilename", e.target.value);
                        }}
                        inputProps={{
                            pattern: "[A-Za-z0-9_]+",
                        }}
                        fullWidth={true}
                        disabled={mode === "modify"}
                        label="Alphanumeric and Underscore Allowed (No Spaces)"
                        required={true}
                    />
                </Row>
            </div>
            <br />
        </>
    );
});

export const Period = observer(props => {
    const {
        period,
        id,
        mode,
        studyDesign,
        cannotChangeDB,
        addonMode,
        message,
        submitEnabled,
        isDraft,
    } = props;
    const classes = useStyles();

    const [responseHasCodes, setResponseHasCodes] = React.useState(false);

    React.useEffect(() => {
        if (!id) {
            period.create(studyDesign);
        } else if (id) {
            period.load(job.data, mode, addonMode, isDraft);
            setResponseHasCodes(period.areVariablesAdded(job.data.studyObject));
        }
    }, [period, id, mode, studyDesign, addonMode, isDraft]);

    return (
        <>
            <CssBaseline />
            <Paper className={classes.paper}>
                <ProjectAndOutput {...props} />
            </Paper>
            <br />
            <Paper className={classes.paper}>
                <SelectDatabase
                    {...props}
                    cannotChangeDB={cannotChangeDB}
                    responseHasCodes={responseHasCodes}
                    message={message}
                    submitEnabled={submitEnabled}
                />
            </Paper>
            <br />
            <Paper className={classes.paper}>
                <StudyDuration {...props} />
            </Paper>
            <br />
        </>
    );
});
