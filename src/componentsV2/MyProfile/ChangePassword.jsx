import React from "react";
import { observer } from "mobx-react";
import { BasicButton } from "../Common/BasicButton";
import Grid from "@mui/material/Grid2";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Container from "@mui/material/Container";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import useTheme from "@mui/material/styles/useTheme";
import { validatePasswordRules } from "../../utils";

import passwordReset from "../../state/store/signup/password-reset";
import { InputPassword } from "../Common/InputPassword";
import { MAX_PWD_LENGTH, MIN_PWD_LENGTH } from "../../constants";
import { lightTheme } from "../Styles/theme";
import { DisplayAvatar } from "../Common/Avatar";
import { ShowSuccess, ShowWarning } from "../Common/Toast";

const ChangePassword = observer(() => {
    const [current, setCurrent] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmNewPassword, setConfirmNewPassword] = React.useState("");

    const [minLength, setMinLength] = React.useState(false);
    const [upper, setUpper] = React.useState(false);
    const [lower, setLower] = React.useState(false);
    const [number, setNumber] = React.useState(false);
    const [splChar, setSplChar] = React.useState(false);

    const theme = useTheme();

    const checkRule = value => {
        setNewPassword(value);

        const validateResult = validatePasswordRules(value);
        setMinLength(validateResult.minLength);
        setUpper(validateResult.upper);
        setLower(validateResult.lower);
        setNumber(validateResult.number);
        setSplChar(validateResult.splChar);
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
            checkRule("");
        }
    };

    const enableButton =
        current &&
        upper &&
        lower &&
        number &&
        splChar &&
        minLength &&
        newPassword === confirmNewPassword;

    return (
        <Container
            component="main"
            maxWidth="sm"
            sx={{
                paddingTop: theme.spacing(2),
                width: "100%", // Fix IE 11 issue.
                textAlign: "center",
                justifyItems: "center",
            }}
        >
            <DisplayAvatar size="xl" randomColor={false} bgcolor={lightTheme.palette.primary.light}>
                <LockOutlinedIcon
                    sx={{
                        width: 75,
                        height: 75,
                        color: lightTheme.palette.primary.dark,
                    }}
                />
            </DisplayAvatar>
            <form onSubmit={updatePassword} noValidate>
                <InputPassword
                    id="currentPassword"
                    label="Current Password"
                    name="currentPassword"
                    autoComplete="current-password"
                    autoFocus
                    value={current}
                    onChange={e => setCurrent(e.target.value)}
                    sx={{
                        bgcolor: theme => theme.palette.grey.light,
                    }}
                />
                <InputPassword
                    id="newPassword"
                    label="New Password"
                    name="newPassword"
                    autoComplete="new-password"
                    MAX_PWD_LENGTH={MAX_PWD_LENGTH}
                    value={newPassword}
                    onChange={e => checkRule(e.target.value)}
                    sx={{
                        bgcolor: theme => theme.palette.grey.light,
                    }}
                />
                <InputPassword
                    name="confirmPassword"
                    label="Confirm Password"
                    id="confirmPassword"
                    autoComplete="new-password"
                    MAX_PWD_LENGTH={MAX_PWD_LENGTH}
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    sx={{
                        bgcolor: theme => theme.palette.grey.light,
                    }}
                />
                <Grid
                    container
                    rowSpacing={1}
                    columnSpacing={0}
                    sx={{
                        justifyItems: "left",
                        textAlign: "left",
                        bgcolor: theme =>
                            theme.palette.mode === "dark"
                                ? theme.palette.grey.light
                                : theme.palette.grey.main,
                        borderRadius: "10px",
                        padding: theme.spacing(2),
                        marginTop: theme.spacing(2),
                    }}
                >
                    <Grid size={1}>
                        {current && current.length > 0 ? (
                            <CheckIcon color="success" />
                        ) : (
                            <CancelIcon color="error" />
                        )}
                    </Grid>
                    <Grid size={11}>Fill current password</Grid>
                    <Grid size={1}>
                        {minLength ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
                    </Grid>
                    <Grid size={11}>Minimum {MIN_PWD_LENGTH} Characters</Grid>
                    <Grid size={1}>
                        {upper ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
                    </Grid>
                    <Grid size={11}>At least one Uppercase English Character</Grid>
                    <Grid size={1}>
                        {lower ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
                    </Grid>
                    <Grid size={11}>At least one Lowercase Character</Grid>
                    <Grid size={1}>
                        {number ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
                    </Grid>
                    <Grid size={11}>At least one number from 0 to 9</Grid>
                    <Grid size={1}>
                        {splChar ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
                    </Grid>
                    <Grid size={11}>At least one Special Character</Grid>
                    <Grid size={1}>
                        {newPassword === confirmNewPassword && confirmNewPassword.length > 0 ? (
                            <CheckIcon color="success" />
                        ) : (
                            <CancelIcon color="error" />
                        )}
                    </Grid>
                    <Grid size={11}>New password matches confirm password</Grid>
                </Grid>
                <BasicButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={!enableButton}
                    sx={{
                        margin: theme.spacing(3, 0, 2),
                        padding: theme.spacing(2, 2, 2, 2),
                        borderRadius: "35px",
                        width: "max-content",
                    }}
                    buttonText="Change Password"
                />
            </form>
        </Container>
    );
});

export default ChangePassword;
