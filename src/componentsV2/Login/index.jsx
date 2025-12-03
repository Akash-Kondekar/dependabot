import React, { useRef } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Link, useNavigate } from "react-router-dom";
import session, { PENDING_USER_MESSAGE } from "../../state/store/session.js";
import { useTheme } from "@emotion/react";
import { DExtERFullLogo, validateNumberInput } from "../../utils/index.jsx";
import { AUTHENTICATION_TOKEN_LABEL, MFA_TYPE, THEME_COLOR } from "../../constants/index.jsx";
import { QRCodeCanvas } from "qrcode.react";
import { BasicStepper } from "../Common/Stepper.jsx";
import { Input } from "../Common/Input.jsx";
import { BasicButton } from "../Common/BasicButton.jsx";
import { BasicLink } from "../Common/BasicLink.jsx";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckEmailImg from "../assets/check-email-illustration.svg?react";
import MFAScanImg from "../assets/mfa-scan-image.svg?react";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { ShowError } from "../Common/Toast.jsx";
import { CustomSVGImage } from "../Common/CustomSVGImage.jsx";

const OTP_MAX_LENGTH = 6;
const steps = ["Install Authenticator App", "Scan QR code", "Enter OTP to verify"];
const otpInputs = Array(OTP_MAX_LENGTH).fill("");

export const Login = () => {
    const [userName, setUserName] = React.useState("");
    const [password, setPassword] = React.useState("");

    const [needMFA, setNeedMFA] = React.useState(false);

    const [needQR, setNeedQR] = React.useState(false);

    const [qr, setQR] = React.useState("");
    const [needFirstVerification, setNeedFirstVerification] = React.useState(false);

    const [staleUserMessage, setStaleUserMessage] = React.useState(false);

    const [stepperStage, setStepperStage] = React.useState(-1);

    const [showPassword, setShowPassword] = React.useState(false);
    const [pendingUserMessage, setPendingUserMessage] = React.useState(false);

    const inputRefs = useRef(otpInputs.map(() => React.createRef()));

    const navigate = useNavigate();

    const systemTheme = useTheme();

    const login = async e => {
        e.preventDefault();

        const { registerQR, needMFA, error, staleUser, pendingFirstVerification, pendingUser } =
            await session.login({
                userID: userName.toLowerCase(),
                password: password,
            });

        if (error) {
            pendingUser && setPendingUserMessage(true);
            return;
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
            navigate("/home/new"); // Redirect to home page after successful login. This is required as we are now rendering public routes using outlet
        }
    };

    const isDarkMode = systemTheme.palette.mode === "dark";

    const showStepper = needQR || needFirstVerification;

    function getStyle(isDarkMode) {
        return isDarkMode
            ? { color: THEME_COLOR.DARK, cursor: "pointer" }
            : { color: THEME_COLOR.LIGHT, cursor: "pointer" };
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
            navigate("/home/new");
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

    const validateCode = async verifyQR => {
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
            navigate("/home/new");
        }
    };

    const handleStepperBack = () => {
        setStepperStage(stepperStage - 1);
    };

    const handleNext = async () => {
        if (stepperStage === 0 && needQR && !qr) {
            await generateQRCode();
        }
        setStepperStage(stepperStage + 1);
    };

    const handleMouseDownPassword = event => {
        event.preventDefault();
        setShowPassword(true);
    };

    const handleMouseUpPassword = event => {
        event.preventDefault();
        setShowPassword(false);
    };

    const GenerateAndValidateQR = () => {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <QRCodeCanvas value={qr} style={{ padding: "8px", background: "white" }} />
            </Box>
        );
    };

    const RegisterQRStep2 = () => {
        return (
            <Box sx={{ textAlign: "center", px: 2 }}>
                <Box sx={{ margin: "0 auto" }}>
                    <DisplayOTPInputs
                        disabled={!qr && !needFirstVerification}
                        autoSubmit={false}
                        heading="Enter the 6-digit code here"
                        subheading="Please enter the OTP from the Authenticator App associated with your Dexter
                    account."
                        resend={false}
                        displayBack={false}
                    />
                </Box>
            </Box>
        );
    };

    const RegisterQR = () => {
        return (
            <Box sx={{ textAlign: "center", px: 2 }}>
                <Typography variant="h6" align="center" sx={{ mb: 4 }}>
                    Scan this QR code using your (Google or Microsoft) Authenticator App. Open the
                    app, use the scan QR code button, and point your camera to the QR code below
                </Typography>
                <GenerateAndValidateQR />
            </Box>
        );
    };

    const Resend = ({ resetOTP, setMFAType }) => {
        const [showMessage, setShowMessage] = React.useState(false);
        const [timer, setTimer] = React.useState(0);
        const [showResendOtp, setShowResendOtp] = React.useState(false);

        const intervalRef = React.useRef(null);
        const RESEND_DURATION_IN_MILLISECONDS = 5000;

        React.useEffect(() => {
            const initialTimer = setTimeout(() => {
                setShowMessage(true);
            }, RESEND_DURATION_IN_MILLISECONDS);

            return () => clearTimeout(initialTimer); // Cleanup on unmount
        }, []);

        // Cleanup interval on unmount
        React.useEffect(() => {
            return () => clearInterval(intervalRef.current);
        }, []);

        const resendOTP = async () => {
            setShowMessage(false); // Hide "Send OTP"
            setShowResendOtp(true); // Show "Resend OTP"
            setTimer(RESEND_DURATION_IN_MILLISECONDS / 1000); // Start timer for 5 seconds for resend

            intervalRef.current = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer <= 1) {
                        clearInterval(intervalRef.current);
                        setShowResendOtp(false);
                        setShowMessage(true); // Show "Send OTP" again after timer
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            //Change here
            await session.resendOTP({
                userId: userName.toLowerCase(),
                token: "otp",
            });
            setMFAType(MFA_TYPE.EMAIL);

            //Bring the focus back to the text field after user clicks on {"Can't use your phone? Send OTP via email"}
            inputRefs.current[0]?.current?.focus();

            resetOTP(otpInputs); // on click of resend, clear otp inputs
        };

        return (
            <Box sx={{ mt: 2 }}>
                {showMessage && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                        <Typography variant="body1">{"Can't use your phone? "}</Typography>

                        <BasicLink
                            handleClick={resendOTP}
                            buttonText="Send OTP via email."
                            color="primary.link"
                        />
                    </div>
                )}
                {showResendOtp && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                        <Typography variant="body1">{`Resend OTP in ${timer}s`}</Typography>
                    </div>
                )}
            </Box>
        );
    };

    const ResetQRMessage = () => {
        return (
            <Box sx={{ px: 2 }}>
                {needFirstVerification ? (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>
                            {`You may have registered for ${AUTHENTICATION_TOKEN_LABEL} by scanning a QR code using either Google or Microsoft Authenticator App on your device. To verify this, please enter the OTP associated with your Dexter account from the App.`}
                        </Typography>
                        <Typography sx={{ textAlign: "center", mt: 4, mb: "5%" }}>
                            <Link to="/forgot/new?type=qr" style={getLinkStyles}>
                                <strong>{`Having trouble? Click here to reset your ${AUTHENTICATION_TOKEN_LABEL}.`}</strong>
                            </Link>
                        </Typography>
                    </Box>
                ) : null}
            </Box>
        );
    };

    const StaleUserMessage = () => {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    px: 2,
                    py: 4,
                }}
            >
                <CustomSVGImage
                    alt="Dexter-staleusers-email-image"
                    style={{
                        marginBottom: "1rem",
                        maxWidth: "10vw",
                        height: "100%",
                        marginTop: "2rem",
                        width: "100%",
                    }}
                    color={systemTheme.palette.imageColor.main}
                    Image={CheckEmailImg}
                />
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Its been a while since you have logged In.
                    <br />
                    To securely access your account, We need you to re-confirm your email address.
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Please check your email for next steps.
                </Typography>
            </Box>
        );
    };

    const PendingUserMessage = () => {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    px: 2,
                    py: 4,
                    my: "6vw",
                }}
            >
                <PriorityHighIcon sx={{ fontSize: "8rem" }} color="warning" />
                <Typography variant="h5" sx={{ fontWeight: 500, mt: 3 }}>
                    {PENDING_USER_MESSAGE}
                </Typography>
            </Box>
        );
    };

    const DisplayOTPInputs = ({
        disabled = false,
        autoSubmit = true,
        displayBack = true,
        heading = "",
        subheading = "",
        resend,
    }) => {
        const [otp, setOTP] = React.useState(otpInputs);
        const [activeInput, setActiveInput] = React.useState(0); // keep track of focused input
        const [mfaType, setMFAType] = React.useState(MFA_TYPE.QR);

        //bring the focus to first input field when the component mounts
        React.useEffect(() => {
            inputRefs.current[0]?.current?.focus();
        }, []);

        const focusedInput = index => {
            setActiveInput(index);
        };

        const setOTPAndHandleSubmission = (inputValue, index) => {
            if (!validateNumberInput(inputValue) || inputValue.length > 1) return; // Allow only single digits

            const newValue = [...otp];
            newValue[index] = inputValue;
            setOTP(newValue);

            if (inputValue && index < OTP_MAX_LENGTH - 1) {
                inputRefs.current[index + 1]?.current?.focus();
            }

            focusedInput(activeInput + 1);

            const finalValue = newValue.join("");

            finalValue.length === OTP_MAX_LENGTH && autoSubmit && submitOTP(finalValue, mfaType);
        };

        const handleBackspaceAndEnter = (e, index) => {
            if (e.key === "Backspace" && !otpInputs[index]) {
                e.preventDefault();
                inputRefs.current[index - 1]?.current?.focus();
                focusedInput(index - 1);
            }
            if (e.key === "Enter" && e.target.value && index < OTP_MAX_LENGTH - 1) {
                inputRefs.current[index + 1]?.current?.focus();
                focusedInput(index + 1);
            }
        };

        const handlePaste = event => {
            if (!validateNumberInput(event.clipboardData.getData("text"))) return; // Allow only digits

            setOTP(otpInputs);

            const pastedData = event.clipboardData
                .getData("text")
                .slice(0, OTP_MAX_LENGTH - activeInput)
                .split("");

            const newValue = [...otp];
            let nextActiveInput = activeInput;

            // Paste data from focused input onwards
            for (let pos = 0; pos < OTP_MAX_LENGTH; ++pos) {
                if (pos >= activeInput && pastedData.length > 0) {
                    newValue[pos] = pastedData.shift() ?? "";
                    nextActiveInput++;
                }
            }

            focusedInput(nextActiveInput);
            setOTP(newValue);
            const finalValue = newValue.join("");

            finalValue.length === OTP_MAX_LENGTH && autoSubmit && submitOTP(finalValue, mfaType);
        };

        const handleFocus = (event, index) => {
            setActiveInput(index);
            event.target.select();
        };

        const handleBack = () => {
            setOTP(otpInputs);
            setNeedMFA(false);
            setNeedFirstVerification(false);
            setStaleUserMessage(false);
            setPendingUserMessage(false);
        };

        return (
            <Box sx={{ width: "100%", mt: 2 }}>
                {displayBack && (
                    <Grid container>
                        <Grid size={12} sx={{ mb: 6 }}>
                            <BasicLink
                                handleClick={handleBack}
                                buttonText="Back to Login"
                                displayArrow={true}
                            />
                        </Grid>
                    </Grid>
                )}

                <Container maxWidth="sm" sx={{ mt: 4 }}>
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                            {heading}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ mb: 4 }}>
                            {subheading}
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 1,
                                flexWrap: "wrap",
                                mb: "10%",
                                mt: "12%",
                            }}
                        >
                            {otp?.map((digit, index) => (
                                <Input
                                    key={`otp-${index}`}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    id={`otp-${index}`}
                                    label=""
                                    name="otp"
                                    autoFocus
                                    type="text"
                                    inputRef={inputRefs.current[index]}
                                    onChange={e =>
                                        setOTPAndHandleSubmission(e.target.value?.toString(), index)
                                    }
                                    onKeyUp={e => handleBackspaceAndEnter(e, index)}
                                    onPaste={handlePaste}
                                    onFocus={event => handleFocus(event, index)}
                                    value={digit}
                                    maxLength="1"
                                    disabled={disabled}
                                    sx={{
                                        width: "40px",
                                        borderRadius: "12px",
                                        margin: "2px",
                                    }}
                                />
                            ))}
                        </Box>

                        {resend && <Resend resetOTP={setOTP} setMFAType={setMFAType} />}

                        {!autoSubmit && (
                            <BasicButton
                                variant="contained"
                                disabled={!qr && !needFirstVerification}
                                handleClick={() => validateCode(otp?.join(""))}
                                buttonText="Validate Code"
                                color="primary"
                                type="submit"
                                sx={{ mt: 3, mb: 3 }}
                            />
                        )}
                    </Box>
                </Container>
            </Box>
        );
    };

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingRight: "16px",
                    flexShrink: 0,
                    margin: "0 20px",
                }}
            >
                <DExtERFullLogo
                    handleClick={() => {
                        setNeedMFA(false);
                        setNeedFirstVerification(false);
                        setStaleUserMessage(false);
                        setStepperStage(-1);
                        setPendingUserMessage(false);
                        setNeedQR(false);
                    }}
                    style={{
                        cursor: "pointer",
                        paddingLeft: "4px",
                    }}
                />

                {!needMFA && !needQR && !staleUserMessage && !pendingUserMessage && (
                    <Typography variant="h6">
                        <BasicLink
                            handleClick={() => navigate("/publications")}
                            buttonText="Publications"
                            color="primary.link"
                            sx={{ fontSize: "24px" }}
                        />
                    </Typography>
                )}
            </Box>

            {/* Main Content */}
            <Container component="main" maxWidth="100%" sx={{ margin: "2% auto auto auto" }}>
                {/* Stepper Header */}
                {showStepper && (
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            {`Set up your ${AUTHENTICATION_TOKEN_LABEL}`}
                        </Typography>
                        <BasicStepper
                            steps={steps}
                            activeStep={stepperStage}
                            handleBack={handleStepperBack}
                            handleNext={handleNext}
                            hideBackButton={!needQR}
                        />
                    </Box>
                )}

                {/* Content based on state */}
                {needMFA && !needFirstVerification && (
                    <DisplayOTPInputs
                        heading="Verify with OTP"
                        subheading="Enter the 6-digit code generated in your mobile."
                        resend={true}
                        autoSubmit={true}
                    />
                )}

                {stepperStage === 0 && (
                    <Container>
                        <Box sx={{ textAlign: "center", px: 2 }}>
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                Install Google Authenticator App or Microsoft Authenticator App on
                                your mobile device. Open the preferred Authenticator App and use the
                                scan QR code button and be ready to scan the token you will see in
                                the next page
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    mt: 3,
                                    mb: "25px",
                                }}
                            >
                                <CustomSVGImage
                                    alt="Authenticator-App"
                                    style={{
                                        maxHeight: "250px",
                                        maxWidth: "100%",
                                        height: "100%",
                                        width: "100%",
                                    }}
                                    color={systemTheme.palette.imageColor.main}
                                    Image={MFAScanImg}
                                />
                            </Box>
                        </Box>
                    </Container>
                )}

                {stepperStage === 1 && (
                    <Container>
                        <RegisterQR />
                    </Container>
                )}

                {stepperStage === 2 && (
                    <Container>
                        <RegisterQRStep2 />
                        <ResetQRMessage />
                    </Container>
                )}

                {/* Main Login Form */}
                {!needMFA && !needQR && !staleUserMessage && !pendingUserMessage && (
                    <Container maxWidth="xl" sx={{ marginBottom: "25px" }}>
                        <Grid
                            container
                            spacing={4}
                            justifyContent="flex-start"
                            alignItems="center"
                            sx={{ mb: 8 }}
                        >
                            {/* Login Form */}
                            <Grid
                                size={{ xs: 12, md: 7, lg: 5, xl: 5 }}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                    px: { xs: 2, sm: 4 },
                                    flex: "1 1 auto",
                                }}
                            >
                                <Box sx={{ width: "100%" }}>
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            mb: 1,
                                            fontWeight: 700,
                                        }}
                                    >
                                        Sign in
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            mb: 1,
                                            fontWeight: 600,
                                        }}
                                        component="h4"
                                    >
                                        to Dexter
                                    </Typography>

                                    <form onSubmit={login}>
                                        <Input
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
                                        <Input
                                            variant="outlined"
                                            margin="normal"
                                            required
                                            fullWidth
                                            name="password"
                                            label="Password"
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            autoComplete="current-password"
                                            onChange={e => setPassword(e.target.value)}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label={
                                                                showPassword
                                                                    ? "hide the password"
                                                                    : "display the password"
                                                            }
                                                            onMouseDown={handleMouseDownPassword}
                                                            onMouseUp={handleMouseUpPassword}
                                                            edge="end"
                                                        >
                                                            {showPassword ? (
                                                                <VisibilityOff />
                                                            ) : (
                                                                <Visibility />
                                                            )}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        <Box sx={{ textAlign: "right", mb: 2 }}>
                                            <Typography variant="body1">
                                                <BasicLink
                                                    buttonText=" Trouble Logging In?"
                                                    color="primary.link"
                                                    handleClick={() => navigate("/forgot/new")}
                                                />
                                            </Typography>
                                        </Box>

                                        <BasicButton
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            sx={{
                                                mb: 2,
                                            }}
                                            handleClick={() => null}
                                            buttonText="Sign In"
                                            disabled={
                                                userName.trim() === "" ||
                                                password.trim() === "" ||
                                                session.isLoading
                                            }
                                        />
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Typography variant="body1">
                                                {"Don't have an account? "}
                                            </Typography>
                                            &nbsp;
                                            <BasicLink
                                                buttonText="Sign Up"
                                                color="primary.link"
                                                handleClick={() => navigate("/register")}
                                            />
                                        </div>
                                    </form>
                                </Box>
                            </Grid>

                            {/* Image */}
                            <Grid
                                size={{ xs: 12, md: 6, lg: 5, xl: 6 }}
                                sx={{
                                    display: { xs: "none", md: "flex" },
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginBottom: "15px",
                                }}
                            >
                                <img
                                    src="/assets/img/newImages/login-image.svg"
                                    alt="Login"
                                    style={{
                                        height: "100%",
                                        width: "35vw",
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Container>
                )}

                {/* Stale User Message */}
                {staleUserMessage && (
                    <Container maxWidth="md">
                        <StaleUserMessage />
                    </Container>
                )}

                {/*Pending User Message */}
                {pendingUserMessage && (
                    <Container maxWidth="md">
                        <PendingUserMessage />
                    </Container>
                )}
            </Container>
        </Box>
    );
};
