import React from "react";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { observer } from "mobx-react";
import FaceIcon from "@mui/icons-material/Face";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import makeStyles from "@mui/styles/makeStyles";
import session from "../../state/store/session";
import { formatDate } from "../../utils";

export const MyProfile = observer(() => {
    return <Profile />;
});

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
}));

const Profile = observer(() => {
    const classes = useStyles();

    return (
        <Container component="main" maxWidth="sm">
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <FaceIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    User Profile
                </Typography>
                <form className={classes.form} noValidate>
                    <TextField
                        margin="normal"
                        disabled
                        required
                        fullWidth
                        label="Registered Email:"
                        value={session.user.userId}
                    />
                    <TextField
                        margin="normal"
                        disabled
                        fullWidth
                        value={
                            (session.user?.registrationDate &&
                                formatDate(session.user.registrationDate)) ||
                            ""
                        }
                        id="memberSince:"
                        label="Member Since:"
                        name="memberSince:"
                    />
                    <TextField
                        margin="normal"
                        disabled
                        fullWidth
                        name="status"
                        label="Role"
                        id="status"
                        value={session.user.roleDescription}
                    />
                    <TextField
                        margin="normal"
                        disabled
                        fullWidth
                        name="userName"
                        label="User Name"
                        id="userName"
                        value={session.user.userFullName}
                    />
                </form>
            </div>
        </Container>
    );
});
