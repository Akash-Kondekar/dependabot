import React from "react";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { observer } from "mobx-react";
import QrCodeIcon from "@mui/icons-material/QrCode";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import CssBaseline from "@mui/material/CssBaseline";
import makeStyles from "@mui/styles/makeStyles";
import session from "../../state/store/session";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { AUTHENTICATION_TOKEN_LABEL } from "../../constants";
import { Confirm } from "../Common";

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
        width: "100%",
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export const ResetQRCode = observer(() => {
    const classes = useStyles();

    const changeQRCode = async e => {
        e.preventDefault();

        const { isConfirmed } = await Confirm(
            `Reset ${AUTHENTICATION_TOKEN_LABEL}`,
            `This action will log you out, and you will be required to register for a new ${AUTHENTICATION_TOKEN_LABEL}. Do you wish to continue?`
        );
        if (isConfirmed) {
            const serverResp = await session.resetQRCode(session.loggedInUser);
            if (serverResp.success) {
                await session.logout();
            }
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <QrCodeIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Reset {`${AUTHENTICATION_TOKEN_LABEL}`}
                </Typography>
                <form className={classes.form} noValidate>
                    <Alert severity="info">
                        <AlertTitle>{`${AUTHENTICATION_TOKEN_LABEL}`} </AlertTitle>
                        You are about to change your {`${AUTHENTICATION_TOKEN_LABEL}`}, which will
                        affect your next login. Please open the relevant Authenticator app on your
                        phone or device and be ready to scan the new code.
                    </Alert>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={changeQRCode}
                    >
                        Submit
                    </Button>
                    <Alert severity="warning">
                        Resetting your {`${AUTHENTICATION_TOKEN_LABEL}`} will log you out.
                    </Alert>
                </form>
            </div>
        </Container>
    );
});
