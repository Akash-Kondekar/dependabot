import React from "react";
import session from "../../state/store/session";
import { EmailVerificationStatus } from "../../constants";
import { useTheme } from "@emotion/react";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { DExtERFullLogo, useQuery } from "../../utils";
import CheckEmailImg from "../assets/check-email-illustration.svg?react";
import ClickHere from "../assets/click-here-illustration.svg?react";
import VerificationDone from "../assets/verification-done-illustration.svg?react";
import { BasicButton } from "../Common/BasicButton.jsx";
import Grid from "@mui/material/Grid2";
import { BasicLink } from "../Common/BasicLink.jsx";
import { useNavigate } from "react-router-dom";
import { ShowError } from "../Common/Toast";

const VerifyStaleUsers = () => {
    const query = useQuery();

    const userId = query.get("user");
    const token = query.get("token");

    const [message, setMessage] = React.useState(false);
    const [emailVerified, setEmailVerified] = React.useState(false);
    const [emailRetry, setEmailRetry] = React.useState(false);

    const systemTheme = useTheme();
    const navigate = useNavigate();

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
    const handleBackToLogin = () => {
        navigate("/login");
    };

    const VerifyEmail = () => {
        return (
            <>
                <ClickHere
                    alt="Click-Here-Illustration"
                    style={{
                        height: "100%",
                        marginBottom: "2rem",
                        marginTop: "2rem",
                        width: "100%",
                        maxWidth: "10vw",
                    }}
                    color={systemTheme.palette.imageColor.main}
                />
                <Typography variant="h6">
                    Thank you for visiting Dexter. To complete the email verification process,
                    please click the button below.
                </Typography>

                <BasicButton
                    justify="end"
                    type="submit"
                    variant="contained"
                    color="primary"
                    handleClick={verifyEmail}
                    buttonText="Verify Email"
                    sx={{ marginTop: "1rem" }}
                />
            </>
        );
    };

    const SuccessfulVerificationMessage = () => {
        return (
            <>
                <VerificationDone
                    alt="Verification-Done-Illustration"
                    style={{
                        height: "100%",
                        marginBottom: "1rem",
                        marginTop: "2rem",
                        width: "100%",
                        maxWidth: "10vw",
                    }}
                    color={systemTheme.palette.imageColor.main}
                />
                <Typography component="h6" variant="h6">
                    Thank you for completing the email verification process. Go back to login page
                    to log into Dexter
                </Typography>
            </>
        );
    };

    const LinkExpiredMessage = () => {
        return (
            <>
                <CheckEmailImg
                    alt="Dexter-resend-link-image"
                    style={{
                        maxWidth: "10vw",
                        height: "100%",
                        marginBottom: "1rem",
                        marginTop: "2rem",
                        width: "100%",
                    }}
                    color={systemTheme.palette.imageColor.main}
                />
                <Typography component="h6" variant="h6">
                    This link got expired, We have sent another email.
                </Typography>
                <Typography component="h6" variant="h6">
                    Please check your email for next steps.
                </Typography>
            </>
        );
    };

    return (
        <>
            <Container component="main" maxWidth="100%">
                <Grid container>
                    <Grid size={11}>
                        <span
                            onClick={handleBackToLogin}
                            style={{
                                cursor: "pointer",
                            }}
                        >
                            <DExtERFullLogo />
                        </span>
                    </Grid>
                    <Grid size={1}></Grid>
                </Grid>

                <div style={{ marginTop: "50px" }}>
                    <BasicLink
                        handleClick={handleBackToLogin}
                        buttonText="Back to Login"
                        displayArrow={true}
                    />
                </div>
            </Container>
            <Container
                component="main"
                maxWidth="lg"
                sx={{ textAlign: "center", marginTop: "2rem" }}
            >
                <div>
                    {!message && <VerifyEmail />}

                    {emailVerified && <SuccessfulVerificationMessage />}

                    {emailRetry && <LinkExpiredMessage />}
                </div>
            </Container>
        </>
    );
};

export default VerifyStaleUsers;
