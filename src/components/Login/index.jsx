import React, { useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Grid2 as Grid, Step, StepLabel, Stepper } from "@mui/material";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import Container from "@mui/material/Container";
import { Link, useNavigate } from "react-router-dom";
import session from "../../state/store/session";
import { useTheme } from "@emotion/react";
import { DExtERFullLogo, validateNumberInput } from "../../utils/index.jsx";
import { Footer } from "../Footer/index.jsx";
import { ShowError } from "../Common";
import { AUTHENTICATION_TOKEN_LABEL, MFA_TYPE, THEME_COLOR } from "../../constants/index.jsx";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowBack } from "@mui/icons-material";

const useStyles = makeStyles(theme => ({
    paper: {
        marginTop: theme.spacing(6),
        marginBottom: theme.spacing(4),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    otpMessage: {
        fontSize: "12px",
        textAlign: "center",
        margin: "15px 0px",
    },

    resendOtp: {
        fontSize: "14px",
        textAlign: "center",
    },
    resendOtpMessage: {
        marginLeft: "5px",
        cursor: "pointer",
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },

    otpCancel: {
        margin: theme.spacing(3, 0, 2),
        "& a": {
            textDecoration: "none",
            color: "inherit",
        },
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
    showQrButton: {
        color: "#fff",
        backgroundColor: "#1976d2",
        fontSize: "16px",
        padding: "6px 16px",
        borderRadius: "4px",
        border: "none",
        margin: "15px 0px",
        cursor: "pointer",
        width: "45%",
    },
    mfaValidator: {
        padding: "0px 5px",
        marginBottom: "35px",
        width: "100%",

        "& h3": {
            fontSize: "16px",
            marginBottom: "12px",
            fontWeight: "600",
        },
        "& h2": {
            fontSize: "22px",
            marginBottom: "20px",
            fontWeight: "600",
            textDecoration: "underline",
            textUnderlineOffset: "7px",
            textDecorationColor: "#1976d2",
        },
    },
    ValidateQrPin: {
        color: "#fff",
        backgroundColor: "#1976d2",
        fontSize: "16px",
        padding: "6px 16px",
        borderRadius: "4px",
        border: "none",
        margin: "15px 0px",
        cursor: "pointer",
        width: "45%",
        float: "inline-end",
    },
    mfaDescription: {
        marginBottom: "12px",
        "& h6": {
            fontSize: "14px",
            fontWeight: "300",
        },
    },
    stepTwoValidate: {
        border: "1px solid #eee",
        padding: "15px",
        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
    },
    stepOneValidate: {
        padding: "15px",
        border: "1px solid #eee",
        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
    },
    otpReferenceImage: {
        textAlign: "center",
        "& img": {
            width: "35%",
        },
    },
    qrCodeMobile: {
        width: "53%",
        paddingLeft: "44px",
    },

    imageContainer: {
        display: "flex",
        alignItems: "center",
        marginTop: "30px",
        justifyContent: "space-evenly",
    },

    imageContainerImg: {
        height: "135px",
        width: "auto",
    },

    imageContainerImgTwo: {
        height: "150px",
        width: "auto",
    },
    staleUserEmailText: {
        fontSize: "16px",
        fontWeight: "400",
        padding: "10px 0px",
        textAlign: "center",
    },
    staleUserEmailImage: {
        width: "7%",
        margin: "0 auto",
        display: "block",
    },
    emailVerificationText: {
        fontSize: "16px",
        textAlign: "center",
        fontWeight: "600",
    },
    // New stepper styles
    stepper: {
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(4),
        "& .MuiStepConnector-line": {
            borderTopWidth: 2,
        },
        "& .MuiStepConnector-root": {
            top: 12,
        },
        "& .MuiStepIcon-root": {
            width: 30,
            height: 30,
            color: theme.palette.grey[300],
            border: `2px solid ${theme.palette.grey[300]}`,
            borderRadius: "50%",
            "&.Mui-active": {
                color: theme.palette.primary.main,
                border: `2px solid ${theme.palette.primary.main}`,
            },
            "&.Mui-completed": {
                color: theme.palette.primary.main,
                border: `2px solid ${theme.palette.primary.main}`,
            },
        },
        "& .MuiStepLabel-root": {
            flexDirection: "column",
        },
        "& .MuiStepLabel-label": {
            marginTop: theme.spacing(1),
            textAlign: "center",
            fontSize: "14px",
            "&.Mui-active": {
                color: theme.palette.text.primary,
                fontWeight: 600,
            },
            "&.Mui-completed": {
                color: theme.palette.text.primary,
            },
        },
    },
    stepperNav: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(2),
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
    },
    stepContent: {
        textAlign: "center",
        maxWidth: "800px",
        margin: "0 auto",
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4),
    },
    stepDescription: {
        textAlign: "center",
        marginBottom: theme.spacing(3),
        fontSize: "16px",
    },
    stepImage: {
        margin: theme.spacing(4, 0),
        textAlign: "center",
    },
}));

export const Login = () => {
    const [userName, setUserName] = React.useState("");
    const [password, setPassword] = React.useState("");

    const [needMFA, setNeedMFA] = React.useState(false);

    const [needQR, setNeedQR] = React.useState(false);

    const [qr, setQR] = React.useState("");
    const [verifyQR, setVerifyQR] = React.useState("");
    const [needFirstVerification, setNeedFirstVerification] = React.useState(false);

    const [staleUserMessage, setStaleUserMessage] = React.useState(false);

    const [stepperStage, setStepperStage] = React.useState(-1);

    const inputOtpRef = useRef();

    const classes = useStyles();
    const navigate = useNavigate();

    const systemTheme = useTheme();

    const OTP_MAX_LENGTH = 6;

    const login = async e => {
        e.preventDefault();

        const { registerQR, needMFA, error, staleUser, pendingFirstVerification } =
            await session.login({
                userID: userName.toLowerCase(),
                password: password,
            });

        if (error) {
            return; // Don't do anything..
        }

        if (staleUser) {
            setStaleUserMessage(true);
        } else if (needMFA) {
            setNeedMFA(true);
            setStepperStage(pendingFirstVerification ? 2 : -1);
            setNeedFirstVerification(pendingFirstVerification);
        } else if (registerQR) {
            setStepperStage(0);
            setNeedQR(true);
        } else {
            setNeedMFA(false);
            navigate("/");
        }
    };

    const isDarkMode = systemTheme.palette.mode === "dark";

    const showStepper = needQR || needFirstVerification;

    function getStyle(isDarkMode) {
        return isDarkMode ? { color: THEME_COLOR.DARK } : { color: THEME_COLOR.LIGHT };
    }

    const getLinkStyles = getStyle(isDarkMode);

    const submitOTP = async (token, mfaType) => {
        if (token.length < OTP_MAX_LENGTH) {
            return; // wait for users to enter OTP
        }
        if (token.length > OTP_MAX_LENGTH) {
            return ShowError("Invalid OTP");
        }

        const success = await session.verifyOTP({
            userId: userName.toLowerCase(),
            token: token,
            mfaType,
        });

        if (success) {
            navigate("/");
            setNeedMFA(false);
        }
    };

    const generateQRCode = async () => {
        const qrCode = await session.generateQRCode({
            userID: userName.toLowerCase(),
            password: "otp", // Anything can be sent.
        });
        setQR(qrCode);
    };

    const validateCode = async () => {
        if (verifyQR.trim() === "") {
            return ShowError("Please provide an OTP");
        }

        const { MFAFailed, error } = await session.validateQRCode({
            userId: userName.toLowerCase(),
            token: verifyQR,
            mfaType: MFA_TYPE.QR,
        });

        if (error) {
            return;
        }

        if (MFAFailed) {
            ShowError("Incorrect OTP, Please try again.");
            setNeedMFA(true);
        } else {
            setNeedMFA(false);
            navigate("/");
        }
    };

    const GenerateAndValidateQR = () => {
        return (
            <div className={classes.imageContainer}>
                <QRCodeCanvas
                    value={qr}
                    className={classes.imageContainerImgTwo}
                    style={{ padding: "5px", background: "white" }}
                />
            </div>
        );
    };

    const RegisterQRStep2 = () => {
        const handleValidateQRChange = value => {
            if (!validateNumberInput(value)) return; // Allow only digits

            if (value.length <= OTP_MAX_LENGTH) {
                setVerifyQR(value);
            }
        };
        return (
            <>
                <Typography variant="h6" gutterBottom>
                    Enter the 6-digit code here
                </Typography>
                <Typography className={classes.stepDescription}>
                    Please enter the OTP from the Authenticator App associated with your Dexter
                    account.
                </Typography>
                <Box sx={{ maxWidth: "400px", margin: "0 auto" }}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="otp"
                        label="Enter One Time Password"
                        name="TOTP"
                        value={verifyQR}
                        autoFocus
                        disabled={!qr && !needFirstVerification}
                        type="text"
                        onChange={e => handleValidateQRChange(e.target.value)}
                    />
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={(!qr && !needFirstVerification) || verifyQR.length < 6}
                        className={classes.submit}
                        onClick={validateCode}
                    >
                        Validate Code
                    </Button>
                </Box>
            </>
        );
    };

    const RegisterQR = () => {
        return (
            <>
                <Typography className={classes.stepDescription} align="center">
                    Scan this QR code using your (Google or Microsoft) Authenticator App. Open the
                    app, use the scan QR code button, and point your camera to the QR code below
                </Typography>
                <GenerateAndValidateQR />
            </>
        );
    };

    const Resend = React.memo(function Resend({ resetOTP, setMFAType }) {
        const [showMessage, setShowMessage] = React.useState(false);
        const [timer, setTimer] = React.useState(5);
        const [showResendOtp, setShowResendOtp] = React.useState(false);

        const intervalRef = React.useRef(null);
        const RESEND_DURATION_IN_MILLISECONDS = 5000;

        React.useEffect(() => {
            const initialTimer = setTimeout(() => {
                setShowMessage(true);
            }, RESEND_DURATION_IN_MILLISECONDS);

            return () => clearTimeout(initialTimer);
        }, []);

        const startTimer = () => {
            setTimer(5); // Reset countdown
            setShowResendOtp(true);
            setShowMessage(false);
            intervalRef.current = setInterval(() => {
                setTimer(prevSeconds => {
                    if (prevSeconds <= 1) {
                        clearInterval(intervalRef.current);
                        setShowResendOtp(false);
                        setShowMessage(true);
                        return 0;
                    }
                    return prevSeconds - 1;
                });
            }, 1000);
        };

        const resendOTP = async () => {
            startTimer();

            //Change here
            await session.resendOTP({
                userId: userName.toLowerCase(),
                token: "otp",
            });
            setMFAType(MFA_TYPE.EMAIL);

            //Bring the focus back to the text field after user clicks on {"Can't use your phone? Send OTP via email"}
            inputOtpRef.current?.focus();

            resetOTP("");
        };

        return (
            <div>
                {showMessage && (
                    <Typography className={classes.resendOtp} component="h6" variant="h6">
                        {"Can't use your phone?"}
                        <span
                            style={getLinkStyles}
                            onClick={resendOTP}
                            className={classes.resendOtpMessage}
                        >
                            Send OTP via email.
                        </span>
                    </Typography>
                )}
                {showResendOtp && (
                    <Typography
                        className={classes.resendOtp}
                        component="h6"
                        variant="h6"
                    >{`Resend OTP in ${timer}s`}</Typography>
                )}
            </div>
        );
    });

    const ResetQRMessage = () => {
        return (
            <Grid size={10}>
                {needFirstVerification ? (
                    <Box marginBottom={5}>
                        <Typography>
                            {`You may have registered for ${AUTHENTICATION_TOKEN_LABEL} by scanning a QR code using either Google or Microsoft Authenticator App on your device. To verify this, please enter the OTP associated with your Dexter account from the App.`}
                        </Typography>
                        <Typography sx={{ textAlign: "center" }}>
                            <Link to="/forgot?type=qr" style={getLinkStyles}>
                                <strong>{`Having trouble? Click here to reset your ${AUTHENTICATION_TOKEN_LABEL}.`}</strong>
                            </Link>
                        </Typography>
                    </Box>
                ) : null}
            </Grid>
        );
    };

    const StaleUserMessage = () => {
        return (
            <>
                <img
                    className={classes.staleUserEmailImage}
                    src={"/assets/img/Check Email illustration.svg"}
                    alt="Dexter-staleusers-email"
                />
                <Typography className={classes.staleUserEmailText} component="h6" variant="h6">
                    Its been a while since you have logged In.
                    <br />
                    To securely access your account, We need you to re-confirm your email address.
                </Typography>

                <Typography className={classes.emailVerificationText} component="h6" variant="h6">
                    Please check your email for next steps.
                </Typography>
            </>
        );
    };

    const DisplayOTPTextField = () => {
        const [otp, setOTP] = React.useState("");
        const [mfaType, setMFAType] = React.useState(MFA_TYPE.QR);

        const handleBack = () => {
            setOTP("");
            setNeedMFA(false);
            setNeedFirstVerification(false);
            setStaleUserMessage(false);
        };

        const setOTPAndHandleSubmission = e => {
            const value = e.target.value;

            if (!validateNumberInput(value)) return; // Allow only digits

            if (value.length <= OTP_MAX_LENGTH) {
                setOTP(value);

                if (value.length === OTP_MAX_LENGTH) {
                    submitOTP(value, mfaType);
                }
            }
        };

        const handlePaste = event => {
            if (!validateNumberInput(event.clipboardData.getData("text"))) return; // Allow only digits

            const pastedData = event.clipboardData.getData("text").slice(0, OTP_MAX_LENGTH);

            if (pastedData.length <= OTP_MAX_LENGTH) {
                setOTP(pastedData);

                if (pastedData.length === OTP_MAX_LENGTH) {
                    submitOTP(pastedData, mfaType);
                }
            }
        };

        return (
            <>
                <form className={classes.form}>
                    <Typography align="center" component="h6" variant="h6">
                        Verify with OTP
                    </Typography>
                    <Typography
                        align="center"
                        className={classes.otpMessage}
                        component="h6"
                        variant="h6"
                    >
                        To ensure your security, Please enter the OTP from
                    </Typography>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="otp"
                        label="Enter One Time Password"
                        name="otp"
                        value={otp}
                        autoFocus
                        type="text"
                        onChange={e => setOTPAndHandleSubmission(e)}
                        onPaste={handlePaste}
                        inputRef={inputOtpRef}
                        slotProps={{ htmlInput: { min: 0 } }}
                    />

                    <Resend resetOTP={setOTP} setMFAType={setMFAType} />

                    <Grid container>
                        <Grid size={6}>
                            <Button
                                justify="end"
                                variant="text"
                                className={classes.otpCancel}
                                onClick={handleBack}
                                startIcon={<ArrowBack />}
                            >
                                Back to Login
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </>
        );
    };

    const handleBackToLogin = () => {
        setNeedMFA(false);
        setNeedFirstVerification(false);
        setStaleUserMessage(false);
        setStepperStage(-1);
        setNeedQR(false);
    };

    return (
        <div>
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
            <Container component="main" maxWidth={showStepper ? "lg" : "xs"}>
                <CssBaseline />

                <div className={classes.paper}>
                    <DExtERFullLogo
                        handleClick={() => handleBackToLogin()}
                        style={{ cursor: "pointer" }}
                    />

                    <Typography component="h1" variant="h5" sx={{ marginBottom: 3 }}>
                        {showStepper
                            ? `Set up your ${AUTHENTICATION_TOKEN_LABEL}`
                            : "Sign in to Dexter"}
                    </Typography>

                    {showStepper && (
                        <Box width="100%">
                            <Stepper
                                activeStep={stepperStage}
                                alternativeLabel
                                className={classes.stepper}
                            >
                                <Step completed={stepperStage > 0}>
                                    <StepLabel>Install Authenticator App</StepLabel>
                                </Step>
                                <Step completed={stepperStage > 1}>
                                    <StepLabel>Scan QR code</StepLabel>
                                </Step>
                                <Step completed={stepperStage > 2}>
                                    <StepLabel>Enter OTP to verify</StepLabel>
                                </Step>
                            </Stepper>

                            <Box className={classes.stepperNav}>
                                <Box>
                                    {stepperStage > 0 && needQR && (
                                        <Button
                                            variant="outlined"
                                            onClick={() => {
                                                setStepperStage(stepperStage - 1);
                                            }}
                                            disabled={!needQR}
                                        >
                                            Back
                                        </Button>
                                    )}
                                </Box>
                                <Box>
                                    {stepperStage < 2 && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={async () => {
                                                if (stepperStage === 0 && needQR && !qr) {
                                                    await generateQRCode();
                                                }
                                                setStepperStage(stepperStage + 1);
                                            }}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {needMFA && !needFirstVerification && <DisplayOTPTextField />}

                    {stepperStage === 0 && (
                        <Box className={classes.stepContent}>
                            <Typography className={classes.stepDescription} align="center">
                                Install Google Authenticator App or Microsoft Authenticator App on
                                your mobile device. Open the preferred Authenticator App and use the
                                scan QR code button and be ready to scan the token you will see in
                                the next page
                            </Typography>
                            <Box className={classes.stepImage}>
                                <img
                                    src="/assets/img/mfa-scan-image.svg"
                                    alt="Authenticator App"
                                    style={{ maxHeight: "200px" }}
                                />
                            </Box>
                        </Box>
                    )}

                    {stepperStage === 1 && (
                        <Box className={classes.stepContent}>
                            <RegisterQR />
                        </Box>
                    )}

                    {stepperStage === 2 && (
                        <Box className={classes.stepContent}>
                            <RegisterQRStep2 />
                            <ResetQRMessage />
                        </Box>
                    )}

                    {!needMFA && !needQR && !staleUserMessage && (
                        <form className={classes.form} onSubmit={login}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                type="email"
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                onChange={e => setUserName(e.target.value)}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                onChange={e => setPassword(e.target.value)}
                            />
                            <FormControlLabel
                                control={<Checkbox value="remember" />}
                                label="Remember me"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                disabled={userName.trim() === "" || password.trim() === ""}
                            >
                                Sign In
                            </Button>
                            <Grid container>
                                <Grid size="grow">
                                    <Typography variant="h6" className={classes.accountlink}>
                                        <Link to="/forgot" style={getLinkStyles}>
                                            Trouble Logging In?
                                        </Link>
                                    </Typography>
                                </Grid>
                                <Grid>
                                    <Typography variant="h6" className={classes.accountlink}>
                                        <Link to="/register" style={getLinkStyles}>
                                            {"Don't have an account? Sign Up"}
                                        </Link>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </form>
                    )}
                </div>
            </Container>
            {staleUserMessage && (
                <div className={classes.paper} style={{ marginTop: 0 }}>
                    <StaleUserMessage />
                </div>
            )}
            <Footer />
        </div>
    );
};
