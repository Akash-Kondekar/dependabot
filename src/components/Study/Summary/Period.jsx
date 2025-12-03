import React from "react";
import period from "../../../state/store/study/period";
import { CROSS_SECTIONAL, radioOptionsDatabaseTypes } from "../../../constants";
import { Card, CardContent, CardHeader, Divider, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import studyDatabase from "../../../state/store/study/database";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";

const useLocalStyles = makeStyles(() => ({
    title: {
        fontWeight: 500,
        fontSize: "22px",
    },
    root: {
        marginBottom: "25px",
    },
}));

const Period = ({ setStep = undefined }) => {
    const { studyStart, studyEnd, practiceOption, studyDesign } = period.data;

    const setTheStep = step => {
        setStep(step);
    };

    const classes = useLocalStyles();

    let database = studyDatabase.dbDetailsSummary();

    if (database === undefined || database?.name === undefined) {
        database = studyDatabase.dbDetails(studyDatabase.data?.id);
    }

    const practiceOptionLabel = radioOptionsDatabaseTypes.find(
        option => option.value === practiceOption
    )?.label;

    return (
        <Card className={classes.root}>
            <CardHeader
                title="Study Details"
                className={classes.title}
                action={
                    setStep && (
                        <IconButton aria-label="edit">
                            <EditIcon onClick={() => setTheStep(0)} />
                        </IconButton>
                    )
                }
            />
            <Divider variant="middle" sx={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
            <CardContent>
                <div>
                    <Typography gutterBottom variant="h6" component="div">
                        Database
                    </Typography>
                    {`This `}
                    <strong>
                        {practiceOptionLabel === "Select All Practices"
                            ? "All Practices"
                            : practiceOptionLabel}
                    </strong>
                    {` study will be done in the `}
                    <strong>{database?.name} </strong>
                    {`Database ( version `}
                    <strong>{database?.version} </strong> ){" "}
                </div>

                <div style={{ marginTop: "20px" }}>
                    <Typography gutterBottom variant="h6" component="div">
                        Study Period
                    </Typography>
                    Study details starts from
                    <strong> {studyStart} </strong>
                    {studyDesign !== CROSS_SECTIONAL && (
                        <span>
                            and ends on<strong> {studyEnd} </strong>
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default Period;
