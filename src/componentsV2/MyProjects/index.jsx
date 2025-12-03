import React from "react";
import { observer } from "mobx-react";
import ProjectList from "../../state/store/projects/list.js";
import { NoData } from "../../components/Common/index.js";
import { Grid2 as Grid, PaginationItem } from "@mui/material";
import { ProjectCards } from "./ProjectCards.jsx";
import session from "../../state/store/session.js";
import user from "../../state/store/user.js";
import clients from "../../state/store/admin/clients/list.js";
import Pagination from "@mui/material/Pagination";
import { ProjectSearchBar } from "./ProjectSearchBar.jsx";
import Container from "@mui/material/Container";
import MyProjectsSkeleton from "../Skeletons/MyProjectsSkeleton.jsx";
import { useTheme } from "@mui/material/styles";

export const MyProjects = observer(props => {
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

    return (
        <Container maxWidth="xl">
            {ProjectList.loading || clients.busy || user.busy ? (
                // Added a Skeleton while API is being called
                <MyProjectsSkeleton />
            ) : (
                <DisplayProjectsInDashboard {...props} projectInfo={ProjectList.list} />
            )}
        </Container>
    );
});

export const DisplayProjectCards = observer(({ projectInfo }) => {
    if (!ProjectList.loading && ProjectList.list?.length === 0) {
        return <NoData message="No Project Found" />;
    }

    return projectInfo.map(project => {
        return (
            <Grid
                key={project.projectID}
                size={{
                    xs: 12,
                    md: 6,
                    lg: 4,
                    xl: 3,
                }}
            >
                <>
                    <ProjectCards
                        projectName={project.projectName}
                        projectID={project.projectID}
                        project={project}
                        searchTerm={ProjectList.term}
                    />
                </>
            </Grid>
        );
    });
});

export const DisplayProjectsInDashboard = observer(({ projectInfo }) => {
    const isActiveClient = user?.isActiveClient;
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    const handleChange = async (data, page) => {
        ProjectList.setPage(page);
        await ProjectList.search();
    };

    return (
        <>
            <ProjectSearchBar
                isActiveClient={isActiveClient}
                clientStatus={user?.clientStatusMessage}
            />
            <Grid container spacing={3} style={{ marginTop: "20px" }}>
                <DisplayProjectCards projectInfo={projectInfo} />
            </Grid>
            {ProjectList.pageCount > 1 && (
                <Grid container spacing={3} style={{ marginTop: "40px", justifyContent: "center" }}>
                    <Pagination
                        showFirstButton
                        showLastButton
                        color="primary"
                        variant={isDarkMode ? "outlined" : "text"}
                        shape="rounded"
                        renderItem={item => {
                            return <PaginationItem {...item} />;
                        }}
                        count={ProjectList.pageCount}
                        page={ProjectList.page}
                        onChange={handleChange}
                        hideNextButton={ProjectList.page === ProjectList.pageCount}
                        hidePrevButton={ProjectList.page === 1}
                    />
                </Grid>
            )}
        </>
    );
});

export default MyProjects;
