import React from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "./Footer/Footer.jsx";
import CssBaseline from "@mui/material/CssBaseline";

const LoadLoginComponents = () => {
    return (
        <>
            <CssBaseline />
            <Outlet />
            <Footer />
        </>
    );
};

export default LoadLoginComponents;
