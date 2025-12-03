import React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import Container from "@mui/material/Container";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";

import passwordReset from "../../state/store/signup/password-reset";
import { Grid2 as Grid } from "@mui/material";
import { Link } from "react-router-dom";
import { ResetMessage } from "./ResetMessage";
import { useTheme } from "@emotion/react";
import { MAX_PWD_LENGTH } from "../../constants";
import { ShowSuccess, ShowWarning } from "../../componentsV2/Common/Toast";

const useStyles = makeStyles(theme => ({
    paper: {
        marginTop: theme.spacing(8),
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
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    passwordRule: {
        width: "100%",
        maxWidth: 360,
        textAlign: "left",
    },
    redIcon: {
        position: "relative",
        top: "5px",
        right: "15px",
        color: "red",
    },
    greenIcon: {
        position: "relative",
        top: "5px",
        right: "15px",
        color: "green",
    },
}));

export function Reset() {
    const classes = useStyles();

    const [newPassword, setNewPassword] = React.useState("");
    const [confirmNewPassword, setConfirmNewPassword] = React.useState("");

    const [maxLength, setMaxLength] = React.useState(false);
    const [upper, setUpper] = React.useState(false);
    const [lower, setLower] = React.useState(false);
    const [number, setNumber] = React.useState(false);
    const [splChar, setSplChar] = React.useState(false);
    const [backendMessage, setBackendMessage] = React.useState("");
    const [resetSuccess, setResetSuccess] = React.useState(false);

    const systemTheme = useTheme();
    const isDarkMode = systemTheme.palette.mode === "dark";

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
        } else {
            setResetSuccess(false);
            setBackendMessage(
                "Password reset is not successful. Please try again or contact dexter support."
            );
        }
    };

    const checkRule = value => {
        setConfirmNewPassword(value);

        if (value.match(/(?=.{8,})/)) {
            setMaxLength(true);
        } else {
            setMaxLength(false);
        }

        if (value.match(/(?=.*[A-Z])/)) {
            setUpper(true);
        } else {
            setUpper(false);
        }

        if (value.match(/(?=.*[a-z])/)) {
            setLower(true);
        } else {
            setLower(false);
        }

        if (value.match(/(?=.*[0-9])/)) {
            setNumber(true);
        } else {
            setNumber(false);
        }

        if (value.match(/[^a-z0-9]+/gi)) {
            setSplChar(true);
        } else {
            setSplChar(false);
        }
    };

    const enableButton =
        upper && lower && number && splChar && maxLength && newPassword === confirmNewPassword;

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            {backendMessage !== "" && <ResetMessage msg={backendMessage} success={resetSuccess} />}
            {backendMessage === "" && (
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Change Password
                    </Typography>
                    <form className={classes.form} onSubmit={updatePassword}>
                        {/* <input hidden type="text" autoComplete="username" defaultValue={session.loggedInUser} /> */}
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            type="password"
                            fullWidth
                            id="newPassword"
                            label="New Password"
                            name="newPassword"
                            autoComplete="off"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            inputProps={{
                                maxLength: MAX_PWD_LENGTH,
                            }}
                        />
                        {newPassword?.length > MAX_PWD_LENGTH - 10 && (
                            <div
                                style={{
                                    fontSize: "smaller",
                                    textAlign: "right",
                                    width: "100%",
                                }}
                            >
                                {newPassword?.length}/{MAX_PWD_LENGTH}
                            </div>
                        )}
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            id="confirmPassword"
                            autoComplete="off"
                            value={confirmNewPassword}
                            onChange={e => checkRule(e.target.value)}
                            inputProps={{
                                maxLength: MAX_PWD_LENGTH,
                            }}
                        />
                        <div className={classes.passwordRule}>
                            <ul
                                style={{
                                    listStyleType: "none",
                                    textAlign: "left",
                                }}
                            >
                                <li>
                                    {maxLength ? (
                                        <CheckIcon className={classes.greenIcon} />
                                    ) : (
                                        <CancelIcon className={classes.redIcon} />
                                    )}
                                    Minimum 8 Characters (Mandatory)
                                </li>
                                <li>
                                    {upper ? (
                                        <CheckIcon className={classes.greenIcon} />
                                    ) : (
                                        <CancelIcon className={classes.redIcon} />
                                    )}
                                    At least one Uppercase English Character
                                </li>
                                <li>
                                    {lower ? (
                                        <CheckIcon className={classes.greenIcon} />
                                    ) : (
                                        <CancelIcon className={classes.redIcon} />
                                    )}
                                    At least one Lowercase Character
                                </li>

                                <li>
                                    {number ? (
                                        <CheckIcon className={classes.greenIcon} />
                                    ) : (
                                        <CancelIcon className={classes.redIcon} />
                                    )}
                                    At least one number from 0 to 9
                                </li>
                                <li>
                                    {splChar ? (
                                        <CheckIcon className={classes.greenIcon} />
                                    ) : (
                                        <CancelIcon className={classes.redIcon} />
                                    )}
                                    At least one Special Character
                                </li>
                                <li>
                                    {newPassword === confirmNewPassword &&
                                    newPassword !== "" &&
                                    confirmNewPassword !== "" ? (
                                        <CheckIcon className={classes.greenIcon} />
                                    ) : (
                                        <CancelIcon className={classes.redIcon} />
                                    )}
                                    New password matches confirm password
                                </li>
                            </ul>
                        </div>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            disabled={!enableButton}
                        >
                            Change Password
                        </Button>

                        <Grid container>
                            <Grid size="grow">
                                <Link to="/login" style={isDarkMode ? { color: "LightBlue" } : {}}>
                                    Return to login
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
                </div>
            )}
        </Container>
    );
}
