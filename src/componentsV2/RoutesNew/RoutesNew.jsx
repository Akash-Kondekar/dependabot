import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import ErrorBoundary from "../../components/Common/ErrorBoundary.jsx";
import { Login } from "../Login/index";

import { Publications } from "../Publications/index.jsx";
import { RequireAuth } from "./RequireAuth.jsx";
import App from "../../App";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import storage from "local-storage-fallback";
import { THEME } from "../../constants/index.jsx";
import { Policies } from "../Policies/index.jsx";
import { ThemeContext } from "../Common/ContextProvider";
import { darkTheme, lightTheme } from "../Styles/theme.js";
import LoadLoginComponents from "../LoadLoginComponents.jsx";
import { ProjectDetails } from "../MyProjects/ProjectDetails.jsx";
import { AlertProvider } from "../Common/AlertProvider.jsx";
import Profile from "../MyProfile/index.jsx";
import ComingSoon from "../ComingSoon.jsx";

const Dashboard = lazy(() => import("../Dashboard/index.jsx"));
const MyProjects = lazy(() => import("../MyProjects/index.jsx"));
const Register = lazy(() => import("../Register/index.jsx"));
const Forgot = lazy(() => import("../TroubleLogging/index.jsx"));
const ResetPassword = lazy(() => import("../TroubleLogging/ResetPassword.jsx"));
const ResetMFA = lazy(() => import("../TroubleLogging/ResetMFA.jsx"));
const VerifyEmail = lazy(() => import("../TroubleLogging/VerifyEmail.jsx"));
const StudyProtocol = lazy(() => import("../StudyProtocol/index.jsx"));
const Documentation = lazy(() => import("../Documentation/index.jsx"));
const ViewCode = lazy(() => import("../Phenotype/Library/ViewCode.jsx"));

const ROUTETYPES = { PROTECTED: "protected", PUBLIC: "public" };

const AppRoutes = {
    [ROUTETYPES.PROTECTED]: [
        { PATH: "/", ELEMENT: <Navigate from="/" to="home/new" /> },
        { PATH: "home/new", ELEMENT: <Dashboard /> },
        { PATH: "coming-soon", ELEMENT: <ComingSoon /> },
        { PATH: "/studyprotocols", ELEMENT: <StudyProtocol /> },
        { PATH: "projects/new", ELEMENT: <MyProjects /> },
        { PATH: "projects/details/new", ELEMENT: <ProjectDetails /> },
        { PATH: "profile/new", ELEMENT: <Profile /> },
        { PATH: "help/new", ELEMENT: <Documentation /> },
        {
            PATH: "builder/library/:type/view",
            ELEMENT: <ViewCode />,
        },
    ],
    [ROUTETYPES.PUBLIC]: [
        { PATH: "/", ELEMENT: <Navigate from="/" to="login" /> },
        { PATH: "/login", ELEMENT: <Login /> },
        { PATH: "/publications", ELEMENT: <Publications /> },
        { PATH: "/register", ELEMENT: <Register /> }, //Have kept the path as register since admin can invite users to dexter via admin >> users page and the link generated in the backend contains /register
        { PATH: "/forgot/new", ELEMENT: <Forgot /> },
        { PATH: "/policies/new", ELEMENT: <Policies /> },
        { PATH: "/reset-password", ELEMENT: <ResetPassword /> },
        { PATH: "/change-qr", ELEMENT: <ResetMFA /> },
        { PATH: "/verify-email", ELEMENT: <VerifyEmail /> },
    ],
};

export const LoadNewRoutes = () => {
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

    return (
        <StyledEngineProvider injectFirst>
            <ThemeContext.Provider value={colorMode}>
                <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
                    <AlertProvider>
                        <Router>
                            <Routes>
                                <Route path="/" element={<LoadLoginComponents />}>
                                    {AppRoutes[ROUTETYPES.PUBLIC]?.map(item => (
                                        <Route
                                            key={item.PATH}
                                            path={item.PATH}
                                            element={item.ELEMENT}
                                        />
                                    ))}
                                </Route>
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
                                                <div style={{ marginTop: "20px" }}>
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
                                                </div>
                                            }
                                        />
                                    ))}
                                </Route>
                            </Routes>
                        </Router>
                    </AlertProvider>
                </ThemeProvider>
            </ThemeContext.Provider>
        </StyledEngineProvider>
    );
};
