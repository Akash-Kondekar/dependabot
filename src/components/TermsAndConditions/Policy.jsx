import React from "react";
import session from "../../state/store/session";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Modal,
    Stack,
    Typography,
} from "@mui/material";
import { BasicButton } from "../Common";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import ReactMarkdown from "react-markdown";
import makeStyles from "@mui/styles/makeStyles";
import remarkGfm from "remark-gfm";
import cookies from "../../mds/Terms/cookies.md?raw";
import privacy from "../../mds/Terms/privacy.md?raw";
import { ExpandMore } from "@mui/icons-material";
import projectDetailsStore from "../../state/store/projects/details";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "70%",
    bgcolor: "background.paper",
    borderRadius: "10px",
    outline: "none",
};

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        padding: theme.spacing(2),
    },
    paper: {
        padding: theme.spacing(5),
        textAlign: "left",
    },
}));

const CookiePolicy = observer(() => {
    const [open, setOpen] = React.useState(!session?.isTermsAccepted);
    const [termsData, setTermsData] = React.useState("Loading");
    const [expanded, setExpanded] = React.useState("COOKIES");

    const POLICY_TYPES = {
        COOKIES: "COOKIE POLICY",
        PRIVACY: "PRIVACY POLICY",
    };

    const navigate = useNavigate();

    const classes = useStyles();
    const theme = useTheme();

    function fetchWhatToLoad(panel) {
        if (panel === undefined) return null;
        switch (panel) {
            case "COOKIES":
                return cookies;
            case "PRIVACY":
                return privacy;
            default:
                return null;
        }
    }

    React.useEffect(() => {
        if (open) {
            let content = fetchWhatToLoad(expanded);
            setTermsData(content);
        }
    }, [open, expanded]);

    const updateCookieAcceptedStatus = async () => {
        const success = await session.acceptTerms();

        if (success) {
            navigate("/home");
        } else {
            logoutUser();
        }

        setOpen(false);
    };

    const logoutUser = async () => {
        await session.logout();
        //Clear project details if user is on projects details page and logouts
        projectDetailsStore.resetProject();
        navigate("/login");
    };

    const handleClose = event => {
        event.preventDefault();
        setOpen(false);
        logoutUser();
    };

    const handleChange = panel => (event, isExpanded) => {
        if (!isExpanded) {
            setTermsData("Loading");
        }
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <div>
            <Modal
                open={open}
                onClose={() => null} //Do not perform any action on click anywhere
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography
                        id="modal-modal-title"
                        variant="h2"
                        component="h2"
                        sx={{
                            fontSize: "2.2rem",
                            fontWeight: "400",
                            backgroundColor: "#1976d2",
                            color: "white",
                            p: 2,
                            border: "1px solid transparent",
                            borderRadius: "10px 10px 0px 0px",
                        }}
                    >
                        Terms and Conditions
                    </Typography>
                    <Typography
                        id="modal-modal-description"
                        sx={{ mt: 2, fontSize: "1.275rem" }}
                        component="div"
                    >
                        <div
                            style={{
                                maxHeight: "50vh",
                                overflow: "auto",
                                padding: "20px",
                            }}
                        >
                            {Object.keys(POLICY_TYPES).map(data => {
                                return (
                                    <Accordion
                                        expanded={expanded === data}
                                        onChange={handleChange(data)}
                                        key={data}
                                        sx={{ border: "1px solid #eaecef" }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMore />}
                                            aria-controls="panel1bh-content"
                                            id="panel1bh-header"
                                            sx={{
                                                borderBottom:
                                                    expanded === data
                                                        ? "1px solid #eaecef"
                                                        : "none",
                                            }}
                                        >
                                            <Typography>{POLICY_TYPES[data]}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <div className={classes.root}>
                                                <Typography
                                                    className={classes.custom}
                                                    component="div"
                                                >
                                                    <div
                                                        className={
                                                            theme.palette.mode === "dark"
                                                                ? "markdown-body-dark"
                                                                : "markdown-body-light"
                                                        }
                                                    >
                                                        <ReactMarkdown
                                                            remarkPlugins={[
                                                                [remarkGfm, { singleTilde: false }],
                                                            ]}
                                                        >
                                                            {termsData}
                                                        </ReactMarkdown>
                                                    </div>
                                                </Typography>
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })}
                        </div>
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ padding: "20px" }} alignItems="center">
                        <BasicButton
                            variant="contained"
                            sx={{ mr: 1 }}
                            buttonText="Reject"
                            color="error"
                            handleClick={handleClose}
                        />

                        <BasicButton
                            variant="contained"
                            sx={{ mr: 1 }}
                            buttonText="Accept"
                            handleClick={updateCookieAcceptedStatus}
                        />
                    </Stack>
                </Box>
            </Modal>
        </div>
    );
});

export default CookiePolicy;
