import React from "react";
import { Grid2 as Grid, Paper } from "@mui/material";
import { DisplaySearchBar } from "./DisplaySearchBar";
import { ProjectCards } from "./ProjectCards";
import makeStyles from "@mui/styles/makeStyles";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
import { observer } from "mobx-react";
import ProjectList from "../../state/store/projects/list";
import user from "../../state/store/user";
import { NoData } from "../Common";
import session from "../../state/store/session";
import clients from "../../state/store/admin/clients/list";

export const DisplayProjectDetails = observer(({ projectInfo }) => {
    const classes = useStyles();

    if (!ProjectList.loading && ProjectList.list?.length === 0) {
        return <NoData message="No Project Found" />;
    }

    return projectInfo.map(project => {
        return (
            <Grid
                key={project.projectID}
                style={{ padding: "12px" }}
                size={{
                    xs: 12,
                    md: 12,
                    lg: 3,
                }}
            >
                <Paper className={classes.paper}>
                    <ProjectCards
                        projectName={project.projectName}
                        projectID={project.projectID}
                        project={project}
                        searchTerm={ProjectList.term}
                    />
                </Paper>
            </Grid>
        );
    });
});

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        "& > * + *": {
            marginTop: theme.spacing(2),
        },
    },
    paging: {
        display: "flex",
        flexDirection: "row-reverse",
        padding: "10px",
        marginTop: " 20px",
    },
}));

export const Dashboard = observer(props => {
    React.useEffect(() => {
        (async () => {
            await ProjectList.search();

            if (!session.isAdmin) {
                !user.clientDetailsFetched && (await user.getClientDetails());
            }

            if (session.isAdmin) {
                !clients.allClientDetailsFetched && (await clients.loadAllClients());
            }
        })();
    }, []);

    // Adding a spinner to introduce a wait time while refresh token API is being called to avoid Access Denied message from being shown on UI

    if (ProjectList.loading || clients.busy || user.busy) {
        return "Loading..";
    }

    return <DisplayProjectsInDashboard {...props} projectInfo={ProjectList.list} />;
});

export const DisplayProjectsInDashboard = observer(({ projectInfo, setFilter }) => {
    const classes = useStyles();
    const isActiveClient = user?.isActiveClient;

    const handleChange = async (data, page) => {
        ProjectList.setPage(page);
        await ProjectList.search();
    };

    return (
        <>
            <div className={classes.paper}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                        <DisplaySearchBar
                            setFilter={setFilter}
                            isActiveClient={isActiveClient}
                            clientStatus={user?.clientStatusMessage}
                        />
                    </Grid>
                </Grid>
            </div>
            <Grid container spacing={2} style={{ marginTop: "20px" }}>
                <DisplayProjectDetails projectInfo={projectInfo} />
            </Grid>
            {ProjectList.pageCount > 1 && (
                <div className={classes.paging}>
                    <Typography>Page: {ProjectList.page}</Typography>
                    <Pagination
                        count={ProjectList.pageCount}
                        page={ProjectList.page}
                        onChange={handleChange}
                        hideNextButton={ProjectList.page === ProjectList.pageCount}
                        hidePrevButton={ProjectList.page === 1}
                    />
                </div>
            )}
        </>
    );
});
