import React from "react";
import session from "../../state/store/session";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { EmailVerificationStatus } from "../../constants";
import { ShowError } from "../Common";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@emotion/react";
import { THEME_COLOR } from "../../constants";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Footer } from "../Footer";
import { DExtERFullLogo } from "../../utils";
import CssBaseline from "@mui/material/CssBaseline";
import Button from "@mui/material/Button";

function useQuery() {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search), [search]);
}

export function VerifyEmail() {
    const query = useQuery();

    const userId = query.get("user");
    const token = query.get("token");

    const [message, setMessage] = React.useState(false);
    const [emailVerified, setEmailVerified] = React.useState(false);
    const [emailRetry, setEmailRetry] = React.useState(false);
    const navigate = useNavigate();

    const useStyles = makeStyles(theme => ({
        paper: {
            marginTop: theme.spacing(6),
            marginBottom: theme.spacing(4),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        },
        publications: {
            float: "right",
            marginRight: "50px",
            marginTop: "-50px",
            "& a": {
                marginRight: "10px",
                fontSize: "16px",
                fontWeight: "600",
            },

            display: "flex",
        },
        footeritems: {
            marginTop: "15px",
            cursor: "pointer",
        },
        accountlink: {
            "& a": {
                fontSize: "16px",
                fontWeight: "400",
            },
        },
        staleUserEmailText: {
            fontSize: "16px",
            fontWeight: "400",
            padding: "35px 0px",
            textAlign: "center",
        },
        staleUserEmailImage: {
            width: "8vw",
            marginTop: "35px",
        },
        checkEmailImage: {
            width: "7vw",
            marginTop: "35px",
        },
        emailVerification: {
            borderRadius: "22px",
        },
        emailVerificationText: {
            fontSize: "16px",
            textAlign: "center",
            fontWeight: "600",
        },
    }));

    const systemTheme = useTheme();
    const classes = useStyles();
    const isDarkMode = systemTheme.palette.mode === "dark";
    const getLinkStyles = getStyle(isDarkMode);

    function getStyle(isDarkMode) {
        return isDarkMode ? { color: THEME_COLOR.DARK } : { color: THEME_COLOR.LIGHT };
    }

    async function verifyEmail() {
        const emailCheck = await session.verifyEmailOfStaleUser({
            userId,
            token,
        });

        if (emailCheck === EmailVerificationStatus.SUCCESS) {
            setMessage("Email Verification Successful");
            setEmailVerified(true);
        } else if (emailCheck === EmailVerificationStatus.RETRY) {
            setMessage("Email link expired. We have sent another email");
            setEmailRetry(true);
        } else {
            ShowError();
        }
    }

    const StaleUserVerification = () => {
        return (
            <>
                <img
                    className={classes.staleUserEmailImage}
                    src={"/assets/img/Click here illustration.svg"}
                    alt="Dexter-staleusers-email"
                />
                <Typography className={classes.staleUserEmailText} component="h6" variant="h6">
                    Thank you for visiting Dexter. To complete the email verification process,
                    please click the button below.
                </Typography>
                <Button
                    justify="end"
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.emailVerification}
                    onClick={verifyEmail}
                >
                    Verify Email
                </Button>
            </>
        );
    };

    const StaleUserSuccess = () => {
        return (
            <>
                <img
                    className={classes.staleUserEmailImage}
                    src={"/assets/img/Verification done illustration.svg"}
                    alt="Dexter-staleusers-email"
                />
                <Typography className={classes.staleUserEmailText} component="h6" variant="h6">
                    Thank you for completing the email verification process.
                </Typography>
                <Link style={getLinkStyles} to="/login">
                    Please Click here to Login to Dexter
                </Link>
            </>
        );
    };

    const StaleUserRetry = () => {
        return (
            <>
                <img
                    className={classes.checkEmailImage}
                    src={"/assets/img/Check Email illustration.svg"}
                    alt="Dexter-staleusers-email"
                />
                <Typography className={classes.staleUserEmailText} component="h6" variant="h6">
                    This link got expired, We have sent another email.
                </Typography>
                <Typography className={classes.emailVerificationText} component="h6" variant="h6">
                    Please check your email for next steps.
                </Typography>
            </>
        );
    };

    return (
        <>
            <div className={classes.publications}>
                <Typography variant="h6">
                    <Link
                        to="/publications"
                        style={getLinkStyles}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Publications
                    </Link>
                </Typography>
            </div>
            <Container component="main" maxWidth="sm">
                <CssBaseline />

                <div className={classes.paper}>
                    <DExtERFullLogo
                        handleClick={() => navigate("/login")}
                        style={{
                            cursor: "pointer",
                        }}
                    />

                    {!message && <StaleUserVerification />}

                    {emailVerified && <StaleUserSuccess />}

                    {emailRetry && <StaleUserRetry />}
                </div>
            </Container>
            <Footer />
        </>
    );
}
