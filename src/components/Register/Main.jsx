import React from "react";
import { observer } from "mobx-react";
import { Link, useLocation } from "react-router-dom";
import makeStyles from "@mui/styles/makeStyles";
import { useStyles } from "../useStyles";
import { Button, Container, CssBaseline, Paper, Typography } from "@mui/material";
import registerStore from "../../state/store/signup/register";
import { Input } from "../Common/Input";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import { DExtERFullLogo, isValidEmail } from "../../utils";
import { Footer } from "../Footer";
import Box from "@mui/material/Box";
import { MAX_PWD_LENGTH } from "../../constants";

const useLocalStyles = makeStyles(() => ({
    container: {
        padding: "10px",
        margin: "0 auto",
        marginBottom: "30px",
    },
    subText: {
        marginTop: "10px",
        marginBottom: "10px",
    },
    row: {
        display: "flex",
    },
    column: {
        flex: "50%",
        fontWeight: "bold",
        margin: "10px",
        textAlign: "center",
    },
    center: {
        textAlign: "center",
    },
    passwordRule: {
        width: "100%",
        maxWidth: "fit-content",
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

export const Register = observer(() => {
    const localClasses = useLocalStyles();

    return (
        <>
            <Container
                component="main"
                className={localClasses.container}
                sx={{ maxWidth: "max-content !important" }}
            >
                <div className={localClasses.row}>
                    <div className={localClasses.column}>
                        <div className="col-md-6 m-a-2">
                            <span className={localClasses.center}>
                                <b>
                                    <Link to="/login">
                                        <DExtERFullLogo />
                                    </Link>
                                    <h2>Data Extractor for Epidemiological Research </h2>
                                </b>
                            </span>
                            <Form />
                        </div>
                    </div>
                </div>
            </Container>

            <Footer />
        </>
    );
});

function useQuery() {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search.replace(/&amp;/g, "&")), [search]);
}

const Form = () => {
    const localClasses = useLocalStyles();
    const classes = useStyles();

    let query = useQuery();

    const userID = query.get("userID") ?? "";
    const clientId = query.get("clientId") ?? "";
    const token = query.get("token") ?? "";

    const [showForm, setShowForm] = React.useState(true);
    const [name, setName] = React.useState();
    const [email, setEmail] = React.useState(userID ?? "");
    const [password, setPassword] = React.useState();
    const [maxLength, setMaxLength] = React.useState(false);
    const [upper, setUpper] = React.useState(false);
    const [lower, setLower] = React.useState(false);
    const [number, setNumber] = React.useState(false);
    const [splChar, setSplChar] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const checkRule = value => {
        setPassword(value);

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
    // Filter should return more than two conditions being met.
    const validEmail = isValidEmail(email);
    const isNameNotEmpty = name?.trim().length > 0;
    const enableRegisterButton =
        upper && lower && number && splChar && maxLength && validEmail && isNameNotEmpty;

    const register = async e => {
        e.preventDefault();

        if (enableRegisterButton) {
            const payload = {
                userFullName: name,
                userID: email,
                password,
            };

            if (clientId && token) {
                payload.clientId = clientId;
                payload.token = token;
            }

            const result = await registerStore.register(payload);

            if (result) {
                setMessage(result);
                setShowForm(false);
            }
        }
    };

    return (
        <Container component="main" className={localClasses.container}>
            <CssBaseline />
            <div>
                <Box elevation={3}>
                    <Typography variant="h6" className={localClasses.subText}>
                        {showForm ? "Please fill this form to register to Dexter." : message}
                    </Typography>

                    {showForm && (
                        <form className={classes.form} onSubmit={register}>
                            <Paper elevation={3} className={classes.paper}>
                                {!userID ? (
                                    <Input
                                        name="email"
                                        label="Email Id"
                                        variant="outlined"
                                        autoComplete="email"
                                        type="email"
                                        value={email}
                                        inputProps={{
                                            style: {
                                                textTransform: "lowercase",
                                            },
                                        }}
                                        required
                                        onChange={e => {
                                            setEmail(e.target.value.toLowerCase());
                                        }}
                                    />
                                ) : (
                                    <Typography
                                        component="h5"
                                        variant="body1"
                                        sx={{ paddingBottom: "16px" }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <span style={{ fontWeight: "bold" }}>Email:</span>
                                            <span style={{ marginLeft: "6px" }}>{email}</span>
                                        </div>
                                    </Typography>
                                )}
                                <Input
                                    required
                                    name="name"
                                    label="Name"
                                    variant="outlined"
                                    autoComplete="off"
                                    onChange={e => {
                                        setName(e.target.value);
                                    }}
                                />
                                <Input
                                    name="password"
                                    label="Password"
                                    variant="outlined"
                                    autoComplete="off"
                                    type="password"
                                    required
                                    onChange={e => {
                                        checkRule(e.target.value);
                                    }}
                                    inputProps={{
                                        maxLength: MAX_PWD_LENGTH,
                                    }}
                                />

                                {password?.length > MAX_PWD_LENGTH - 10 && (
                                    <div
                                        style={{
                                            fontSize: "smaller",
                                            textAlign: "right",
                                            width: "100%",
                                        }}
                                    >
                                        {password?.length}/{MAX_PWD_LENGTH}
                                    </div>
                                )}

                                <div className={localClasses.passwordRule}>
                                    <ul
                                        style={{
                                            listStyleType: "none",
                                            textAlign: "left",
                                        }}
                                    >
                                        <li>
                                            {maxLength ? (
                                                <CheckIcon className={localClasses.greenIcon} />
                                            ) : (
                                                <CancelIcon className={localClasses.redIcon} />
                                            )}
                                            Minimum 8 Characters (Mandatory)
                                        </li>
                                        <li>
                                            {upper ? (
                                                <CheckIcon className={localClasses.greenIcon} />
                                            ) : (
                                                <CancelIcon className={localClasses.redIcon} />
                                            )}
                                            At least one Uppercase English Character
                                        </li>
                                        <li>
                                            {lower ? (
                                                <CheckIcon className={localClasses.greenIcon} />
                                            ) : (
                                                <CancelIcon className={localClasses.redIcon} />
                                            )}
                                            At least one Lowercase Character
                                        </li>

                                        <li>
                                            {number ? (
                                                <CheckIcon className={localClasses.greenIcon} />
                                            ) : (
                                                <CancelIcon className={localClasses.redIcon} />
                                            )}
                                            At least one number from 0 to 9
                                        </li>
                                        <li>
                                            {splChar ? (
                                                <CheckIcon className={localClasses.greenIcon} />
                                            ) : (
                                                <CancelIcon className={localClasses.redIcon} />
                                            )}
                                            At least one Special Character
                                        </li>
                                    </ul>
                                </div>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    disabled={!enableRegisterButton}
                                    className={classes.submit}
                                >
                                    Register
                                </Button>
                            </Paper>
                        </form>
                    )}
                </Box>
            </div>
        </Container>
    );
};
