import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import makeStyles from "@mui/styles/makeStyles";
import { useStyles } from "../useStyles";
import {
    Button,
    Card,
    CardActionArea,
    CardContent,
    Container,
    CssBaseline,
    Grid2 as Grid,
    Paper,
    Typography,
} from "@mui/material";

import {
    AUTHENTICATION_TOKEN_LABEL,
    FORGOT_PASSWORD_SUCCESS,
    QR_RESET_SUCCESS_MSG,
    RESET_OPTIONS,
} from "../../constants";

import { Input } from "../Common";
import passwordReset from "../../state/store/signup/password-reset";
import session from "../../state/store/session";

import { DExtERFullLogo, useQuery } from "../../utils";
import { Footer } from "../Footer";

const useLocalStyles = makeStyles(theme => ({
    container: {
        padding: "10px",
        margin: "0 auto",
    },
    message: {
        margin: "10px 10px 0px 15px",
    },
    subText: {
        marginTop: "10px",
        marginBottom: "10px",
        padding: "10px",
    },
    header: {
        textDecoration: "none",
        textAlign: "center",
        marginTop: "4%",
    },
    radioStyle: {
        display: "flex",
        justifyContent: "center",
    },
    root: {
        borderRadius: 7,
        textAlign: "center",
        border: `1px solid ${theme.palette.primary.main}`,
        height: "300px",
        width: "100%",
        fontSize: "1rem",
        fontWeight: 500,
    },
    link: {
        color: theme.palette.primary.main,
        textAlign: "center",
        marginTop: "5%",
    },
}));

export const radioOptionsForReset = [
    {
        value: RESET_OPTIONS.PASSWORD,
        label: "Change Password",
        src: "/assets/img/Reset Password illustration.svg",
        imageWidth: "130px",
    },
    {
        value: RESET_OPTIONS.QR,
        label: `Reset ${AUTHENTICATION_TOKEN_LABEL}`,
        src: "/assets/img/Reset QR illustration.svg",
        imageWidth: "185px",
    },
];

function chooseType(choice) {
    const selected = radioOptionsForReset.filter(item => item.value === choice);
    return selected[0]?.value ?? "";
}

const DisplayOptionsCard = ({ localClasses, setValue, showForm }) => {
    return (
        <div style={{ marginBottom: "100px" }}>
            <Grid container justifyContent={"center"} spacing={2}>
                {radioOptionsForReset?.map(item => (
                    <Grid key={item.label}>
                        <Card
                            className={localClasses.root}
                            sx={{
                                opacity: !showForm ? "0.5" : "1",
                                pointerEvents: !showForm ? "none" : "auto",
                                minWidth: "350px",
                                maxWidth: "350px",
                            }}
                        >
                            <CardActionArea
                                onClick={() => {
                                    setValue(item.value);
                                }}
                                className={localClasses.root}
                            >
                                <CardContent>
                                    <div>
                                        <img
                                            src={item.src}
                                            alt={item.label}
                                            style={{ width: item.imageWidth }}
                                        />
                                    </div>
                                    <div style={{ marginTop: "15px" }}>
                                        {" "}
                                        <Typography variant="h6" className={localClasses.message}>
                                            {item.label}
                                        </Typography>
                                    </div>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Link to="/login">
                <Typography variant="h6" className={localClasses.link}>
                    Return to login page
                </Typography>
            </Link>
        </div>
    );
};

const DisplayResetOption = ({
    classes,
    localClasses,
    showForm,
    requestSuccess,
    serverMessage,
    change,
    value,
    setEmail,
    setValue,
}) => {
    const successStr =
        value === RESET_OPTIONS.PASSWORD ? FORGOT_PASSWORD_SUCCESS : QR_RESET_SUCCESS_MSG;
    return (
        <Grid
            container
            style={{
                justifyContent: "center",
            }}
        >
            <Grid>
                <Paper
                    elevation={3}
                    className={classes.paper8}
                    sx={{
                        width: "500px",
                        maxWidth: "700px",
                    }}
                >
                    <Typography component="h1" variant="h5" className={localClasses.message}>
                        {value === RESET_OPTIONS.QR
                            ? `Want to reset ${AUTHENTICATION_TOKEN_LABEL}?`
                            : "Want to change Password?"}
                    </Typography>
                    <Typography
                        component="h3"
                        variant={showForm ? "body2" : "body1"}
                        className={localClasses.subText}
                    >
                        {showForm
                            ? "Enter the email address associated with your Dexter account."
                            : serverMessage ||
                              (requestSuccess ? `${successStr} ✔️` : "Something went wrong ❌")}
                    </Typography>

                    {showForm && (
                        <form className={classes.form} onSubmit={change}>
                            <Paper elevation={3} className={classes.paper}>
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
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: "20px",
                                    }}
                                >
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        color="primary"
                                        className={classes.submit}
                                        onClick={() => {
                                            setValue("");
                                            setEmail("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        className={classes.submit}
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </Paper>
                        </form>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export const Forgot = observer(() => {
    const classes = useStyles();
    const query = useQuery();
    const type = query.get("type");

    const [value, setValue] = React.useState(chooseType(type));

    const localClasses = useLocalStyles();
    const [email, setEmail] = React.useState("");

    const [showForm, setShowForm] = React.useState(true);
    const [requestSuccess, setRequestSuccess] = React.useState(true);
    const [serverMessage, setServerMessage] = React.useState("");

    const isChangingPassword = value === RESET_OPTIONS.PASSWORD;

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
            <Container component="main" className={localClasses.container}>
                <CssBaseline />
                <div>
                    <Header />
                    {value === "" || value === null ? (
                        <DisplayOptionsCard
                            localClasses={localClasses}
                            setValue={setValue}
                            showForm={showForm}
                        />
                    ) : (
                        <DisplayResetOption
                            classes={classes}
                            localClasses={localClasses}
                            showForm={showForm}
                            requestSuccess={requestSuccess}
                            serverMessage={serverMessage}
                            change={change}
                            value={value}
                            setEmail={setEmail}
                            setValue={setValue}
                        />
                    )}
                </div>
            </Container>

            <Footer />
        </>
    );
});

const Header = () => {
    const localClasses = useLocalStyles();
    return (
        <div className={localClasses.header}>
            <Link to="/login">
                <DExtERFullLogo />
            </Link>
        </div>
    );
};
