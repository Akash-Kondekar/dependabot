import React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import Container from "@mui/material/Container";
import session from "../../state/store/session";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";

import passwordReset from "../../state/store/signup/password-reset";
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

export function ChangePassword() {
    const classes = useStyles();

    const [current, setCurrent] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmNewPassword, setConfirmNewPassword] = React.useState("");

    const [maxLength, setMaxLength] = React.useState(false);
    const [upper, setUpper] = React.useState(false);
    const [lower, setLower] = React.useState(false);
    const [number, setNumber] = React.useState(false);
    const [splChar, setSplChar] = React.useState(false);

    const checkRule = value => {
        setNewPassword(value);

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

    const updatePassword = async e => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            ShowWarning("New Password and Confirm Password do not match");
            return;
        }
        const payload = {
            current: current,
            updated: newPassword,
        };
        const results = await passwordReset.changePassword(payload);
        if (results) {
            ShowSuccess("Password Updated.");
            setCurrent("");
            setNewPassword("");
            setConfirmNewPassword("");
        }
    };

    const enableButton =
        upper && lower && number && splChar && maxLength && newPassword === confirmNewPassword;

    return (
        <Container component="main" maxWidth="sm">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Change Password
                </Typography>
                <form className={classes.form} onSubmit={updatePassword}>
                    <input
                        hidden
                        type="text"
                        autoComplete="username"
                        defaultValue={session.loggedInUser}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="currentPassword"
                        type="password"
                        label="Current Password"
                        name="currentPassword"
                        autoComplete="current-password"
                        autoFocus
                        value={current}
                        onChange={e => setCurrent(e.target.value)}
                    />
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
                        onChange={e => checkRule(e.target.value)}
                    />
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
                        onChange={e => setConfirmNewPassword(e.target.value)}
                    />
                    <div className={classes.passwordRule}>
                        <ul style={{ listStyleType: "none", textAlign: "left" }}>
                            <li>
                                {maxLength ? (
                                    <CheckIcon className={classes.greenIcon} />
                                ) : (
                                    <CancelIcon className={classes.redIcon} />
                                )}
                                Minimum 8 Characters
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
                </form>
            </div>
        </Container>
    );
}
