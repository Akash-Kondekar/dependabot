import React from "react";
import { Dashboard } from "./Dashboard";
import { ProjectDetails } from "./ProjectDetails";
import { useStyles } from "../useStyles";
import session from "../../state/store/session";
import events from "../../lib/events";
import { Grid2 as Grid } from "@mui/material";
import projectDetailsStore from "../../state/store/projects/details";
import { observer } from "mobx-react";
import clientList from "../../state/store/admin/clients/list";

const DashboardMain = observer(() => {
    const userID = session.loggedInUser;
    const { projectID = "", projectName = "" } = projectDetailsStore.project;
    const classes = useStyles();
    const previousProjectId = React.useRef(projectID);

    React.useEffect(() => {
        (async () => {
            // Load All Clients once clicked into the My Project Tab
            session.isAdmin && (await clientList.loadAllClients());
        })();
    }, []);

    React.useEffect(() => {
        return () => {
            // This gets called when the Project Component gets unloaded and another menu is .
            events.emit("reset.projects");
        };
    }, []);

    React.useEffect(() => {
        if (previousProjectId.current !== projectID) {
            session.unsubscribeFromProjectUpdates(previousProjectId.current);
            projectDetailsStore.setSubscribedProject("");
        }
        if (projectID) {
            session.subscribeToProjectUpdates(projectID);
            projectDetailsStore.setSubscribedProject(projectID);
        }
        previousProjectId.current = projectID;
        return () => {
            if (projectID) {
                session.unsubscribeFromProjectUpdates(projectID);
                projectDetailsStore.setSubscribedProject("");
            }
        };
    }, [projectID]);

    return (
        <div className={classes.root}>
            {projectID === "" ? (
                <Grid container justifyContent={"center"}>
                    <Grid
                        size={{
                            xs: 12,
                            md: 11,
                            lg: 11,
                            xl: 10,
                        }}
                    >
                        <Dashboard
                            // projectInfo={projectInfo}
                            userID={userID}
                        />
                    </Grid>
                </Grid>
            ) : (
                <ProjectDetails projectID={projectID} projectName={projectName} userID={userID} />
            )}
        </div>
    );
});

export default DashboardMain;
