import React from "react";

import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";

import passwordReset from "../../state/store/signup/password-reset";
import { Grid2 as Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ResetMessage } from "./ResetMessage";
import { BasicLink } from "../Common/BasicLink";
import { DExtERFullLogo, validatePasswordRules } from "../../utils/index.jsx";
import Box from "@mui/material/Box";
import { InputPassword } from "../Common/InputPassword.jsx";
import { BasicButton } from "../Common/BasicButton";
import "../Styles/styles.css";
import { MAX_PWD_LENGTH } from "../../constants";
import { ShowSuccess, ShowWarning } from "../Common/Toast";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmNewPassword, setConfirmNewPassword] = React.useState("");

    const [minLength, setMinLength] = React.useState(false);
    const [upper, setUpper] = React.useState(false);
    const [lower, setLower] = React.useState(false);
    const [number, setNumber] = React.useState(false);
    const [splChar, setSplChar] = React.useState(false);
    const [backendMessage, setBackendMessage] = React.useState("");
    const [resetSuccess, setResetSuccess] = React.useState(false);

    const navigate = useNavigate();

    const updatePassword = async e => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            ShowWarning("New Password and Confirm Password do not match");
        }
        const payload = {
            updated: newPassword,
        };
        const query = window.location.search;
        const results = await passwordReset.resetPassword(payload, query);
        setBackendMessage(results);
        if (results) {
            setResetSuccess(true);
            ShowSuccess(results);
            setBackendMessage(
                "Password Changed successfully. Go back to login page to log into Dexter."
            );
        } else {
            setResetSuccess(false);
            setBackendMessage(
                "Password reset is not successful. Please try again or contact dexter support."
            );
        }
    };

    const checkRule = value => {
        setNewPassword(value);

        const validateResult = validatePasswordRules(value);
        setMinLength(validateResult.minLength);
        setUpper(validateResult.upper);
        setLower(validateResult.lower);
        setNumber(validateResult.number);
        setSplChar(validateResult.splChar);
    };

    const handleBack = () => {
        navigate("/login");
        setNewPassword("");
        setConfirmNewPassword("");
    };

    const enableButton =
        upper && lower && number && splChar && minLength && newPassword === confirmNewPassword;

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                margin: "auto",
            }}
        >
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
                <span
                    onClick={handleBack}
                    style={{
                        cursor: "pointer",
                    }}
                >
                    <DExtERFullLogo />
                </span>
            </Box>
            <Grid container sx={{ margin: "40px" }}>
                <Grid size={12}>
                    <BasicLink
                        handleClick={handleBack}
                        buttonText="Back to Login"
                        displayArrow={true}
                    />
                </Grid>
            </Grid>
            <Container component="main" maxWidth="sm" sx={{ textAlign: "center" }}>
                {backendMessage !== "" && (
                    <ResetMessage msg={backendMessage} success={resetSuccess} />
                )}
                {backendMessage === "" && (
                    <div>
                        <Typography
                            variant="h4"
                            sx={{ fontWeight: 600, textAlign: "center", marginBottom: "20px" }}
                        >
                            Change Password
                        </Typography>
                        <form onSubmit={updatePassword}>
                            <InputPassword
                                name="newPassword"
                                label="New Password"
                                id="newPassword"
                                variant="outlined"
                                autoComplete="off"
                                value={newPassword}
                                onChange={e => {
                                    checkRule(e.target.value);
                                }}
                                MAX_PWD_LENGTH={MAX_PWD_LENGTH}
                            />

                            <InputPassword
                                name="confirmPassword"
                                label="Confirm Password"
                                id="confirmPassword"
                                variant="outlined"
                                autoComplete="off"
                                value={confirmNewPassword}
                                onChange={e => setConfirmNewPassword(e.target.value)}
                                MAX_PWD_LENGTH={MAX_PWD_LENGTH}
                            />

                            <BasicButton
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={!enableButton}
                                sx={{
                                    mb: 4,
                                    mt: 4,
                                }}
                                handleClick={() => null}
                                buttonText="Change Password"
                            />
                            {newPassword && newPassword !== "" && (
                                <Box
                                    sx={{
                                        width: "100%",
                                        textAlign: "left",
                                        bgcolor: "grey.light",
                                        pl: 2,
                                        pr: 2,
                                        p: 1,
                                        mb: "10%",
                                    }}
                                >
                                    <ul
                                        style={{
                                            listStyleType: "none",
                                            textAlign: "left",
                                        }}
                                    >
                                        <li>
                                            {minLength ? (
                                                <CheckIcon className="iconStyles" color="success" />
                                            ) : (
                                                <CancelIcon className="iconStyles" color="error" />
                                            )}
                                            Minimum 12 Characters (Mandatory)
                                        </li>
                                        <li>
                                            {upper ? (
                                                <CheckIcon color="success" className="iconStyles" />
                                            ) : (
                                                <CancelIcon color="error" className="iconStyles" />
                                            )}
                                            At least one Uppercase English Character
                                        </li>
                                        <li>
                                            {lower ? (
                                                <CheckIcon color="success" className="iconStyles" />
                                            ) : (
                                                <CancelIcon color="error" className="iconStyles" />
                                            )}
                                            At least one Lowercase Character
                                        </li>

                                        <li>
                                            {number ? (
                                                <CheckIcon color="success" className="iconStyles" />
                                            ) : (
                                                <CancelIcon color="error" className="iconStyles" />
                                            )}
                                            At least one number from 0 to 9
                                        </li>
                                        <li>
                                            {splChar ? (
                                                <CheckIcon color="success" className="iconStyles" />
                                            ) : (
                                                <CancelIcon color="error" className="iconStyles" />
                                            )}
                                            At least one Special Character
                                        </li>
                                        <li>
                                            {newPassword === confirmNewPassword &&
                                            newPassword !== "" &&
                                            confirmNewPassword !== "" ? (
                                                <CheckIcon color="success" className="iconStyles" />
                                            ) : (
                                                <CancelIcon color="error" className="iconStyles" />
                                            )}
                                            New password matches confirm password
                                        </li>
                                    </ul>
                                </Box>
                            )}
                        </form>
                    </div>
                )}
            </Container>
        </Box>
    );
};

export default ResetPassword;
