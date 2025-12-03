import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { History } from "../History/HistoryMain";
import { Help } from "../Help/HelpMain";
import ErrorBoundary from "../Common/ErrorBoundary";
import { Login } from "../Login/index";
import { Register } from "../Register/Main";
import { Forgot } from "../Register/Forgot";
import { Reset } from "../Register/Reset";
import { VerifyEmail } from "../Register/VerifyEmail";
import { ChangeQR } from "../Register/ChangeQR";

import { Publications } from "../Publications/Main";
import { RequireAuth } from "./RequireAuth";
import App from "../../App";
import { createTheme, StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import storage from "local-storage-fallback";
import { THEME } from "../../constants/index.jsx";
import { Policies } from "../Policies/index.jsx";
import { MyDatabases } from "../Help/MyDatabases";
import { LoadNewRoutes } from "../../componentsV2/RoutesNew/RoutesNew";
import { observer } from "mobx-react";
import systemConfiguration from "../../state/store/admin/systemConfiguration";
import { AlertProvider } from "../../componentsV2/Common/AlertProvider";

const Dashboard = lazy(() => import("../Dashboard/Index"));
const Admin = lazy(() => import("../Admin/AdminMain"));
const DashboardMain = lazy(() => import("../Projects/DashboardMain"));
const Profile = lazy(() => import("../Profile/ProfileMain"));
const StudyProtocol = lazy(() => import("../StudyProtocol"));
const Client = lazy(() => import("../Admin/Clients/Main"));
const AdminHome = lazy(() => import("../Admin/AdminHome"));
const ClientWizard = lazy(() => import("../Admin/Clients/ManageClientWizard"));
const User = lazy(() => import("../Admin/UserDashboard/UserDashboard"));

const Medical = lazy(() => import("../CodeBuilder/Medical/index.jsx"));
const Drugs = lazy(() => import("../CodeBuilder/Drugs"));
const Library = lazy(() => import("../CodeBuilder/Library/index.jsx"));
const ViewCode = lazy(() => import("../CodeBuilder/Library/View.jsx"));
const AnalyticsDashboard = lazy(() => import("../Study/Analytics/Dashboard/index.jsx"));
const DataExtractionReport = lazy(
    () => import("../Study/Analytics/DataExtractionReport/index.jsx")
);
const AnalyticsSummary = lazy(() => import("../Study/Analytics/Summary/index.jsx"));
const Analysis = lazy(() => import("../Study/Analytics/Analysis/index.jsx"));
const OverallIncPrev = lazy(() => import("../Study/Analytics/Analysis/Overall/index.jsx"));
const SubgroupIncPrev = lazy(() => import("../Study/Analytics/Analysis/Subgroup/index.jsx"));

export const ColorModeContext = React.createContext({
    toggleColorMode: () => {},
});

const ROUTETYPES = {
    PROTECTED: "protected",
    PUBLIC: "public",
};

const AppRoutes = {
    [ROUTETYPES.PROTECTED]: [
        { PATH: "/", ELEMENT: <Navigate from="/" to="home" /> },
        { PATH: "home", ELEMENT: <Dashboard /> },
        { PATH: "projects", ELEMENT: <DashboardMain /> },
        { PATH: "profile", ELEMENT: <Profile /> },
        { PATH: "studyprotocols", ELEMENT: <StudyProtocol /> },
        { PATH: "help", ELEMENT: <Help /> },
        { PATH: "help/governance", ELEMENT: <Help resource={"governance"} /> },
        { PATH: "help/mydatabases", ELEMENT: <MyDatabases /> },
        { PATH: "help/projects", ELEMENT: <Help resource={"projects"} /> },
        { PATH: "help/phenotypelibrary", ELEMENT: <Help resource={"phenotypelibrary"} /> },
        { PATH: "help/studyprotocols", ELEMENT: <Help resource={"studyprotocols"} /> },
        { PATH: "help/designs", ELEMENT: <Help resource={"designs"} /> },
        { PATH: "help/designs/studyperiod", ELEMENT: <Help resource={"studyperiod"} /> },
        { PATH: "help/designs/exposure", ELEMENT: <Help resource={"exposure"} /> },
        { PATH: "help/designs/controlandmatch", ELEMENT: <Help resource={"controlandmatch"} /> },
        { PATH: "help/designs/baseline", ELEMENT: <Help resource={"baseline"} /> },
        { PATH: "help/designs/outcome", ELEMENT: <Help resource={"outcome"} /> },
        { PATH: "help/designs/addvariables", ELEMENT: <Help resource={"addvariables"} /> },
        { PATH: "help/extracteddata", ELEMENT: <Help resource={"extracteddata"} /> },
        { PATH: "help/addons", ELEMENT: <Help resource={"addons"} /> },
        { PATH: "help/cite", ELEMENT: <Help resource={"cite"} /> },
        { PATH: "help/results", ELEMENT: <Help resource={"results"} /> },
        { PATH: "help/privacy", ELEMENT: <Help resource={"privacy"} /> },
        { PATH: "help/cookies", ELEMENT: <Help resource={"cookies"} /> },
        { PATH: "version", ELEMENT: <History /> },
        { PATH: "builder", ELEMENT: <Library /> },
        { PATH: "builder/medical", ELEMENT: <Medical /> },
        { PATH: "builder/drugs", ELEMENT: <Drugs /> },
        {
            PATH: "builder/library/:type/view",
            ELEMENT: <ViewCode />,
        },
        { PATH: "admin", ELEMENT: <AdminHome /> },
        { PATH: "admin/miscellaneous", ELEMENT: <Admin /> },
        { PATH: "admin/client", ELEMENT: <Client /> },
        { PATH: "admin/client/:id", ELEMENT: <ClientWizard /> },
        { PATH: "admin/user", ELEMENT: <User /> },
        { PATH: "analytics", ELEMENT: <Navigate from="/" to="home" /> },
        { PATH: "analytics/home", ELEMENT: <AnalyticsDashboard /> },
        { PATH: "analytics/dataextractionreport", ELEMENT: <DataExtractionReport /> },
        { PATH: "analytics/summary", ELEMENT: <AnalyticsSummary /> },
        { PATH: "analytics/analysis", ELEMENT: <Analysis /> },
        //Placeholders to add the skeleton, needs to be replaced when content is added.
        { PATH: "analytics/analysis/overall", ELEMENT: <OverallIncPrev /> },
        { PATH: "analytics/analysis/subgroup", ELEMENT: <SubgroupIncPrev /> },
    ],
    [ROUTETYPES.PUBLIC]: [
        { PATH: "/login", ELEMENT: <Login /> },
        { PATH: "/register", ELEMENT: <Register /> },
        { PATH: "/forgot", ELEMENT: <Forgot /> },
        { PATH: "/reset-password", ELEMENT: <Reset /> },
        { PATH: "/publications", ELEMENT: <Publications /> },
        { PATH: "/policies", ELEMENT: <Policies /> },
        { PATH: "/verify-email", ELEMENT: <VerifyEmail /> },
        { PATH: "/change-qr", ELEMENT: <ChangeQR /> },
    ],
};

export const LoadRoutes = () => {
    function getInitialTheme() {
        const savedTheme = storage.getItem(THEME);
        return savedTheme === "dark";
    }

    const [isDarkMode, setDarkMode] = React.useState(getInitialTheme);

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                const savedTheme = storage.getItem(THEME);
                if (savedTheme === "light") {
                    storage.setItem(THEME, "dark");
                    setDarkMode(true);
                } else {
                    storage.setItem(THEME, "light");
                    setDarkMode(false);
                }
            },
        }),
        []
    );

    const darkTheme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: "dark",
                },
                components: {
                    MUIDataTableToolbar: {
                        styleOverrides: {
                            root: {
                                paddingLeft: "16px",
                            },
                        },
                    },
                },
            }),
        []
    );

    const lightTheme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: "light",
                },
                components: {
                    MUIDataTableToolbar: {
                        styleOverrides: {
                            root: {
                                paddingLeft: "16px",
                            },
                        },
                    },
                },
            }),
        []
    );

    return (
        <StyledEngineProvider injectFirst>
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
                    <AlertProvider>
                        <Router>
                            <Routes>
                                {AppRoutes[ROUTETYPES.PUBLIC]?.map(item => (
                                    <Route
                                        key={item.PATH}
                                        path={item.PATH}
                                        element={item.ELEMENT}
                                    />
                                ))}
                                <Route path="/" element={<App />}>
                                    {AppRoutes[ROUTETYPES.PROTECTED]?.map(item => (
                                        <Route
                                            key={item.PATH}
                                            path={item.PATH}
                                            element={
                                                <ErrorBoundary>
                                                    <Suspense
                                                        key={item.PATH}
                                                        fallback={<div>Loading...</div>}
                                                    >
                                                        <RequireAuth redirectTo="/login">
                                                            {item.ELEMENT}
                                                        </RequireAuth>
                                                    </Suspense>
                                                </ErrorBoundary>
                                            }
                                        />
                                    ))}
                                </Route>
                            </Routes>
                        </Router>
                    </AlertProvider>
                </ThemeProvider>
            </ColorModeContext.Provider>
        </StyledEngineProvider>
    );
};

export const SwitchRoutes = observer(() => {
    const [loading, setLoading] = React.useState(true);
    //TODO: Temporarily feature to track design switch status. To be removed later.
    React.useEffect(() => {
        (async () => {
            await systemConfiguration.load();
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (
        systemConfiguration.data === "true" &&
        import.meta.env.VITE_SWITCH_TO_NEW_DESIGN === "true"
    ) {
        return <LoadNewRoutes />;
    }
    return <LoadRoutes />;
});
