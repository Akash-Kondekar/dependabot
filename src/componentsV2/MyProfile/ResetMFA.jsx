import React from "react";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { observer } from "mobx-react";
import { BasicButton } from "../Common/BasicButton";
import session from "../../state/store/session";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

import { AUTHENTICATION_TOKEN_LABEL } from "../../constants";
import { Confirm } from "../Common/Confirm";
import { useTheme } from "@mui/material/styles";
import { DisplayAvatar } from "../Common/Avatar";
import { lightTheme } from "../Styles/theme";
import { QrCodeScannerOutlined } from "@mui/icons-material";

const ResetMFA = observer(() => {
    const theme = useTheme();

    const changeQRCode = async e => {
        e.preventDefault();

        const { isConfirmed } = await Confirm(
            `Reset ${AUTHENTICATION_TOKEN_LABEL}`,
            `This action will log you out, and you will be required to register for a new ${AUTHENTICATION_TOKEN_LABEL}. Do you wish to continue?`,
            "warning"
        );
        if (isConfirmed) {
            const success = await session.resetQRCode(session.loggedInUser);
            if (success) {
                await session.logout();
            }
        }
    };

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
                <QrCodeScannerOutlined
                    sx={{
                        width: 75,
                        height: 75,
                        color: lightTheme.palette.primary.dark,
                    }}
                />
            </DisplayAvatar>
            <Typography
                component="h1"
                variant="h4"
                sx={{ margin: theme.spacing(2), textWrap: "nowrap" }}
            >
                Reset {`${AUTHENTICATION_TOKEN_LABEL}`}
            </Typography>
            <form noValidate>
                <Alert
                    severity="info"
                    sx={{
                        bgcolor:
                            theme.palette.mode === "light"
                                ? theme.palette.primary.light
                                : theme.palette.grey.light,
                        color:
                            theme.palette.mode === "light"
                                ? theme.palette.common.black
                                : theme.palette.common.white,
                        textAlign: "start",
                    }}
                >
                    <AlertTitle>{`${AUTHENTICATION_TOKEN_LABEL}`} </AlertTitle>
                    You are about to change your {`${AUTHENTICATION_TOKEN_LABEL}`}, which will
                    affect your next login. Please open the relevant Authenticator app on your phone
                    or device and be ready to scan the new code.
                </Alert>

                <Alert
                    severity="warning"
                    sx={{
                        marginTop: 3,
                        bgcolor: theme.palette.mode === "dark" && theme.palette.warning.light,
                        color: theme.palette.common.black,
                    }}
                >
                    Resetting your {`${AUTHENTICATION_TOKEN_LABEL}`} will log you out.
                </Alert>
                <BasicButton
                    buttonText="Submit"
                    type="submit"
                    fullWidth
                    onClick={changeQRCode}
                    sx={{
                        margin: theme.spacing(3, 0, 2),
                        padding: theme.spacing(2, 2, 2, 2),
                        width: "max-content",
                        borderRadius: "35px",
                    }}
                />
            </form>
        </Container>
    );
});

export default ResetMFA;
