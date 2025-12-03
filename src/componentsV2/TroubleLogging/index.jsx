import React from "react";
import { Box, Container, Grid2 as Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
    AUTHENTICATION_TOKEN_LABEL,
    FORGOT_PASSWORD_SUCCESS,
    QR_RESET_SUCCESS_MSG,
    RESET_OPTIONS,
} from "../../constants/index.jsx";
import { Footer } from "../Footer/Footer";
import { DExtERFullLogo, useQuery } from "../../utils";
import session from "../../state/store/session";
import passwordReset from "../../state/store/signup/password-reset";
import { BasicActionableCard } from "../Common/BasicActionableCard.jsx";
import ChangePwdImg from "../assets/reset-password.svg?react";
import ResetQrImg from "../assets/reset-qr.svg?react";
import { useTheme } from "@emotion/react";
import CheckEmailImg from "../assets/check-email-illustration.svg?react";
import { BasicButton } from "../Common/BasicButton.jsx";
import { Input } from "../Common/Input.jsx";
import { BasicLink } from "../Common/BasicLink.jsx";
import { ResetMessage } from "../TroubleLogging/ResetMessage.jsx";
import { CustomSVGImage } from "../Common/CustomSVGImage.jsx";

const radioOptionsForReset = [
    {
        value: RESET_OPTIONS.PASSWORD,
        label: "Change Password",
        src: ChangePwdImg,
        imageWidth: "130px",
        imageHeight: "100%",
    },
    {
        value: RESET_OPTIONS.QR,
        label: `Reset ${AUTHENTICATION_TOKEN_LABEL}`,
        src: ResetQrImg,
        imageWidth: "200px",
        imageHeight: "100%",
    },
];

function chooseType(choice) {
    const selected = radioOptionsForReset.filter(item => item.value === choice);
    return selected[0]?.value ?? "";
}

const DisplayOptionsCard = ({ setValue, showForm, systemTheme }) => {
    const ContentForCard = ({ item }) => {
        const Image = item.src;
        return (
            <Box sx={{ height: "300px" }}>
                <div>
                    <CustomSVGImage
                        alt={item.label}
                        style={{ width: item.imageWidth, height: item.imageHeight }}
                        color={systemTheme.palette.imageColor.main}
                        Image={Image}
                    />
                </div>
                <div style={{ marginTop: "15px" }}>
                    <Typography variant="h6">{item.label}</Typography>
                </div>
            </Box>
        );
    };
    return (
        <div style={{ marginBottom: "100px", marginTop: "80px" }}>
            <Grid container justifyContent="center" spacing={10}>
                {radioOptionsForReset?.map(item => (
                    <Grid key={item.label}>
                        <BasicActionableCard
                            style={{
                                opacity: !showForm ? "0.5" : "1",
                                pointerEvents: !showForm ? "none" : "auto",
                                textAlign: "center",
                                borderColor: theme => theme.palette.primary.main,
                            }}
                            handleOnClick={() => {
                                setValue(item.value);
                            }}
                            cardContent={<ContentForCard item={item} />}
                        />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

const DisplayResetOption = ({
    showForm,
    requestSuccess,
    serverMessage,
    change,
    value,
    setEmail,
    setValue,
    systemTheme,
    email,
}) => {
    const DisplayResetRequestStatus = ({ selectedResetType }) => {
        const successStr =
            selectedResetType === RESET_OPTIONS.PASSWORD
                ? FORGOT_PASSWORD_SUCCESS
                : QR_RESET_SUCCESS_MSG;
        return (
            <>
                {requestSuccess ? (
                    <>
                        <CustomSVGImage
                            alt="Dexter-check-email-image"
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
                        <br />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {serverMessage || `${successStr} ✔️`}
                        </Typography>
                    </>
                ) : (
                    <ResetMessage msg={serverMessage || "Something went wrong"} success={false} />
                )}
            </>
        );
    };

    return (
        <Grid
            container
            sx={{
                justifyContent: "center",
                mt: "2vw",
                mb: "4%",
            }}
        >
            <Grid size={5} sx={{ textAlign: "center" }}>
                <div>
                    {showForm && (
                        <Typography variant="h4" sx={{ mt: "2vw" }}>
                            {value === RESET_OPTIONS.QR
                                ? `Reset ${AUTHENTICATION_TOKEN_LABEL}?`
                                : "Change Password"}
                        </Typography>
                    )}
                    <br />
                    <Typography variant="h6">
                        {showForm ? (
                            "Enter the email address associated with your Dexter account."
                        ) : (
                            <DisplayResetRequestStatus selectedResetType={value} />
                        )}
                    </Typography>
                    {showForm && (
                        <form onSubmit={change} style={{ marginTop: "50px", marginLeft: "15px" }}>
                            <Input
                                required
                                name="email"
                                label="Email Id"
                                variant="outlined"
                                autoComplete="email"
                                inputProps={{
                                    style: { textTransform: "lowercase" },
                                }}
                                type="email"
                                autoFocus
                                onChange={e => setEmail(e.target.value.toLowerCase())}
                                fullWidth={false}
                                sx={{ width: "70%" }}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "20px",
                                    marginTop: "50px",
                                }}
                            >
                                <BasicButton
                                    type="button"
                                    variant="outlined"
                                    color="primary"
                                    handleClick={() => {
                                        setValue("");
                                        setEmail("");
                                    }}
                                    buttonText="Cancel"
                                />

                                <BasicButton
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    handleClick={() => null}
                                    buttonText="Submit"
                                    disabled={email === ""}
                                />
                            </div>
                        </form>
                    )}
                </div>
            </Grid>
        </Grid>
    );
};

function TroubleLogging() {
    const query = useQuery();
    const type = query.get("type");

    const [value, setValue] = React.useState(chooseType(type));

    const [email, setEmail] = React.useState("");

    const [showForm, setShowForm] = React.useState(true);
    const [requestSuccess, setRequestSuccess] = React.useState(true);
    const [serverMessage, setServerMessage] = React.useState("");

    const navigate = useNavigate();

    const isChangingPassword = value === RESET_OPTIONS.PASSWORD;
    const systemTheme = useTheme();

    const change = async e => {
        e.preventDefault();

        const serverResp = isChangingPassword
            ? await passwordReset.forgotPassword(email.toLowerCase())
            : await session.resetQRCode(email.toLowerCase());

        setRequestSuccess(serverResp.success);
        setServerMessage(serverResp.message);
        setShowForm(false);
    };

    return (
        <>
            <Container component="main" maxWidth="100%">
                <Grid container>
                    <Grid size={11}>
                        <span
                            onClick={() => navigate("/login")}
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
                    {showForm && (
                        <BasicLink
                            handleClick={() => navigate("/login")}
                            buttonText="Back to Login"
                            displayArrow={true}
                        />
                    )}

                    {value === "" || value === null ? (
                        <DisplayOptionsCard
                            setValue={setValue}
                            showForm={showForm}
                            systemTheme={systemTheme}
                        />
                    ) : (
                        <DisplayResetOption
                            showForm={showForm}
                            requestSuccess={requestSuccess}
                            serverMessage={serverMessage}
                            change={change}
                            value={value}
                            setEmail={setEmail}
                            setValue={setValue}
                            systemTheme={systemTheme}
                            email={email}
                        />
                    )}
                </div>
            </Container>

            <Footer />
        </>
    );
}
export default TroubleLogging;
