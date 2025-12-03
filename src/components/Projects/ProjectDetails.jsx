import React from "react";
import { useStyles } from "../useStyles";

import { DisplayProjectDetails } from "./DisplayProjectDetails";
import { Study } from "../Study/StudyMain";
import events from "../../lib/events";
import { Grid2 as Grid } from "@mui/material";

export const ProjectDetails = ({
    projectID,
    projectName,
    /*setProjectName,*/
}) => {
    const [studyID, setStudyID] = React.useState(undefined);
    const [studyJobUUID, setJobUUID] = React.useState(undefined);
    const [studyDesign, setStudyDesign] = React.useState(undefined);
    const [mode, setMode] = React.useState(undefined);
    const [addonMode, setAddonMode] = React.useState(undefined);
    const classes = useStyles();

    const props = {
        addonMode,
        setAddonMode,
    };

    const handleClickOpen = (e, id, type, mode = undefined, jobUUID) => {
        //Load a Study
        e.preventDefault();

        events.emit("reset.period"); // This is to ensure a old store values are reset in the study Store.
        events.emit("reset.expose");
        events.emit("reset.unexposed");
        events.emit("reset.baseline");
        events.emit("reset.outcome");
        events.emit("reset.job");
        events.emit("reset.database");

        setStudyID(id);
        setStudyDesign(type);
        //This is to ensure we don't load the study in Modify Mode.
        if (mode !== undefined) {
            setMode(undefined);
            setAddonMode(undefined);
        }
        setJobUUID(jobUUID);
    };

    const handleModify = (e, id, studyDesign, addonMode = undefined) => {
        setMode("modify");
        if (addonMode !== undefined) {
            setAddonMode(addonMode);
        }
        handleClickOpen(e, id, studyDesign);
    };

    return (
        <div className={classes.root}>
            <Grid container justifyContent={"center"}>
                {studyID === undefined ? (
                    <Grid
                        size={{
                            xs: 12,
                            md: 11,
                            lg: 11,
                            xl: 10,
                        }}
                    >
                        <DisplayProjectDetails
                            projectName={projectName}
                            projectID={projectID}
                            handleClickOpen={handleClickOpen}
                            setStudyID={setStudyID}
                            setStudyDesign={setStudyDesign} // TODO THIS MAY NOT BE NEEDED
                            setMode={handleModify}
                            {...props}
                        />
                    </Grid>
                ) : (
                    <Grid
                        size={{
                            xs: 12,
                            md: 12,
                            lg: 11,
                            xl: 10,
                        }}
                    >
                        <Study
                            projectID={projectID}
                            projectName={projectName}
                            studyID={studyID}
                            studyDesign={studyDesign}
                            mode={mode}
                            setStudyID={setStudyID}
                            {...props}
                            jobUUID={studyJobUUID}
                        />
                    </Grid>
                )}
            </Grid>
        </div>
    );
};
