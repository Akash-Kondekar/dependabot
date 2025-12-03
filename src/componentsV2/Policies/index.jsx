import React from "react";
import privacyPolicy from "../../mds/Terms/privacy.md?raw";
import cookiePolicy from "../../mds/Terms/cookies.md?raw";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../../Style/myCustomCssForMarkDownDark.css";
import "../../Style/myCustomCssForMarkDownLight.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid2";
import { DExtERFullLogo } from "../../utils/index.jsx";
import { POLICY } from "../../constants/index.jsx";
import { useTheme } from "@emotion/react";

export const Policies = () => {
    const [policy, setPolicy] = React.useState("loading...");

    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

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
            <Grid justifyContent="flex-start" container spacing={1} sx={{ mb: 8 }}>
                <Grid outlined="true" size={12}>
                    <Link to="/login">
                        <div style={{ textAlign: "left" }}>
                            <DExtERFullLogo />
                        </div>
                    </Link>
                    <div
                        className={isDarkMode ? "markdown-body-dark" : "markdown-body-light"}
                        style={{ paddingLeft: 20, paddingRight: 20 }}
                    >
                        <ReactMarkdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
                            {policy}
                        </ReactMarkdown>
                    </div>
                </Grid>
            </Grid>
        </>
    );
};
