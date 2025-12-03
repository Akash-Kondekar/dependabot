import React from "react";
import privacyPolicy from "../../mds/Terms/privacy.md?raw";
import cookiePolicy from "../../mds/Terms/cookies.md?raw";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../../Style/myCustomCssForMarkDownDark.css";
import "../../Style/myCustomCssForMarkDownLight.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Grid2 as Grid } from "@mui/material";
import { DExtERFullLogo } from "../../utils";
import { POLICY } from "../../constants";
import { Footer } from "../Footer";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export const Policies = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [policy, setPolicy] = React.useState("loading...");

    const theme = createTheme({
        palette: {
            mode: useTheme().palette.mode,
        },
    });

    React.useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const resource = queryParams.get("res");
        let content = undefined;

        switch (resource) {
            case POLICY.PRIVACY:
                content = privacyPolicy;
                break;
            case POLICY.COOKIE:
                content = cookiePolicy;
                break;
            default:
                navigate("/login");
        }

        if (content) {
            setPolicy(content);
        }
    }, [location]);

    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Grid justifyContent="center" container spacing={1} sx={{ mb: 8 }}>
                    <Grid outlined="true" size={11}>
                        <Link to="/login">
                            <div style={{ textAlign: "center" }}>
                                <DExtERFullLogo />
                            </div>
                        </Link>
                        <div
                            className={
                                theme.palette.mode === "dark"
                                    ? "markdown-body-dark"
                                    : "markdown-body-light"
                            }
                        >
                            <ReactMarkdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
                                {policy}
                            </ReactMarkdown>
                        </div>
                    </Grid>
                </Grid>

                <Footer />
            </ThemeProvider>
        </>
    );
};
