import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Input } from "../Common/Input.jsx";
import { BasicButton } from "../Common/BasicButton.jsx";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import { DExtERFullLogo, isValidEmail, validatePasswordRules } from "../../utils/index.jsx";
import registerStore from "../../state/store/signup/register.js";
import { observer } from "mobx-react";
import Grid from "@mui/material/Grid2";
import { InputPassword } from "../Common/InputPassword.jsx";
import { BasicLink } from "../Common/BasicLink.jsx";
import RegistrationSuccessfulImg from "../assets/registration-successful-check-email.svg?react";
import { useTheme } from "@emotion/react";
import { MAX_PWD_LENGTH } from "../../constants";
import { CustomSVGImage } from "../Common/CustomSVGImage.jsx";

const iconStyles = {
    position: "relative",
    top: "5px",
    right: "15px",
};

const Register = observer(() => {
    const [showForm, setShowForm] = React.useState(true);
    const [message, setMessage] = React.useState("");

    const navigate = useNavigate();
    const systemTheme = useTheme();

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
                    onClick={() => navigate("/login")}
                    style={{
                        cursor: "pointer",
                        paddingLeft: "4px",
                    }}
                >
                    <DExtERFullLogo />
                </span>

                {showForm && (
                    <Typography variant="h6">
                        <BasicLink
                            handleClick={() => navigate("/publications")}
                            buttonText="Publications"
                            color="primary.link"
                            sx={{ fontSize: "24px" }}
                        />
                    </Typography>
                )}
            </Box>
            {!showForm ? (
                <Container maxWidth="md" style={{ textAlign: "center", marginTop: "5%" }}>
                    <CustomSVGImage
                        alt="Dexter-registration-successful-message"
                        style={{ width: "20%", height: "auto", marginBottom: "1rem" }}
                        color={systemTheme.palette.imageColor.main}
                        Image={RegistrationSuccessfulImg}
                    />

                    <Typography variant="h6">{message}</Typography>
                </Container>
            ) : (
                <Container
                    component="main"
                    maxWidth="100%"
                    sx={{ textAlign: "right", margin: "2% auto auto auto" }}
                >
                    <Container maxWidth="xl" sx={{ marginBottom: "25px" }}>
                        <Grid
                            container
                            spacing={4}
                            justifyContent="flex-start"
                            alignItems="center"
                            sx={{ mb: 8 }}
                        >
                            <Grid
                                size={{ xs: 12, md: 7, lg: 5, xl: 5 }}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                    px: { xs: 2, sm: 4 },
                                    flex: "1 1 auto",
                                }}
                            >
                                <Typography
                                    variant="h3"
                                    sx={{
                                        mb: 1,
                                        fontWeight: 700,
                                    }}
                                >
                                    Sign Up
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        mb: 1,
                                        fontWeight: 600,
                                    }}
                                    component="h4"
                                >
                                    to Dexter
                                </Typography>
                                <Typography variant="h6" component="h5">
                                    Data Extractor for Epidemiological Research
                                </Typography>
                                <br />
                                <Form
                                    showForm={showForm}
                                    setShowForm={setShowForm}
                                    setMessage={setMessage}
                                />
                            </Grid>
                            {/* Image */}
                            <Grid
                                size={{ xs: 12, md: 6, lg: 5, xl: 6 }}
                                sx={{
                                    display: { xs: "none", md: "flex" },
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginBottom: "15px",
                                }}
                            >
                                <img
                                    src="/assets/img/newImages/login-image.svg"
                                    alt="Login"
                                    style={{
                                        height: "auto",
                                        width: "35vw",
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Container>
                </Container>
            )}
        </Box>
    );
});

function useQuery() {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search.replace(/&amp;/g, "&")), [search]);
}

const Form = ({ showForm, setShowForm, setMessage }) => {
    let query = useQuery();

    const userID = query.get("userID") ?? "";
    const clientId = query.get("clientId") ?? "";
    const token = query.get("token") ?? "";

    const [name, setName] = React.useState();
    const [email, setEmail] = React.useState(userID ?? "");
    const [password, setPassword] = React.useState();
    const [minLength, setMinLength] = React.useState(false);
    const [upper, setUpper] = React.useState(false);
    const [lower, setLower] = React.useState(false);
    const [number, setNumber] = React.useState(false);
    const [splChar, setSplChar] = React.useState(false);

    const navigate = useNavigate();

    const checkRule = value => {
        setPassword(value);

        const validateResult = validatePasswordRules(value);
        setMinLength(validateResult.minLength);
        setUpper(validateResult.upper);
        setLower(validateResult.lower);
        setNumber(validateResult.number);
        setSplChar(validateResult.splChar);
    };
    // Filter should return more than two conditions being met.
    const validEmail = isValidEmail(email);
    const isNameNotEmpty = name?.trim().length > 0;
    const enableRegisterButton =
        upper && lower && number && splChar && minLength && validEmail && isNameNotEmpty;

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
        <>
            <Container component="main">
                <div>
                    <Box elevation={3}>
                        {showForm && (
                            <form onSubmit={register}>
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
                                <InputPassword
                                    name="password"
                                    id="password"
                                    label="Password"
                                    variant="outlined"
                                    autoComplete="off"
                                    value={password}
                                    onChange={e => {
                                        checkRule(e.target.value);
                                    }}
                                    MAX_PWD_LENGTH={MAX_PWD_LENGTH}
                                />

                                <BasicButton
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={!enableRegisterButton}
                                    buttonText="Sign Up"
                                    handleClick={() => null}
                                    sx={{ mt: 3, borderRadius: "35px", mb: 3 }}
                                />
                                <br />

                                <Typography variant="=body1">
                                    Already have an account? {""}
                                    <BasicLink
                                        handleClick={() => navigate("/login")}
                                        buttonText="Sign In"
                                        displayArrow={false}
                                        color="primary.link"
                                        sx={{ verticalAlign: "top" }}
                                    />
                                </Typography>

                                {((password && password !== "") ||
                                    name?.length > 0 ||
                                    email?.length > 0) && (
                                    <Box
                                        sx={{
                                            width: "100%",
                                            textAlign: "left",
                                            bgcolor: "grey.light",
                                            pl: 2,
                                            pr: 2,
                                            p: 1,
                                            mb: 2,
                                            mt: 2,
                                        }}
                                    >
                                        <ul
                                            style={{
                                                listStyleType: "none",
                                                textAlign: "left",
                                            }}
                                        >
                                            <li>
                                                {validEmail ? (
                                                    <CheckIcon color="success" sx={iconStyles} />
                                                ) : (
                                                    <CancelIcon color="error" sx={iconStyles} />
                                                )}
                                                Email is valid
                                            </li>
                                            <li>
                                                {isNameNotEmpty ? (
                                                    <CheckIcon color="success" sx={iconStyles} />
                                                ) : (
                                                    <CancelIcon color="error" sx={iconStyles} />
                                                )}
                                                Name cannot be empty
                                            </li>
                                            <li>
                                                {minLength ? (
                                                    <CheckIcon color="success" sx={iconStyles} />
                                                ) : (
                                                    <CancelIcon color="error" sx={iconStyles} />
                                                )}
                                                Password has minimum 12 Characters (Mandatory)
                                            </li>
                                            <li>
                                                {upper ? (
                                                    <CheckIcon color="success" sx={iconStyles} />
                                                ) : (
                                                    <CancelIcon color="error" sx={iconStyles} />
                                                )}
                                                Password has at least one Uppercase Character
                                            </li>
                                            <li>
                                                {lower ? (
                                                    <CheckIcon color="success" sx={iconStyles} />
                                                ) : (
                                                    <CancelIcon color="error" sx={iconStyles} />
                                                )}
                                                Password has at least one Lowercase Character
                                            </li>

                                            <li>
                                                {number ? (
                                                    <CheckIcon color="success" sx={iconStyles} />
                                                ) : (
                                                    <CancelIcon color="error" sx={iconStyles} />
                                                )}
                                                Password has at least one Number from 0 to 9
                                            </li>
                                            <li>
                                                {splChar ? (
                                                    <CheckIcon color="success" sx={iconStyles} />
                                                ) : (
                                                    <CancelIcon color="error" sx={iconStyles} />
                                                )}
                                                Password has at least one Special Character
                                            </li>
                                        </ul>
                                    </Box>
                                )}
                            </form>
                        )}
                    </Box>
                </div>
            </Container>
        </>
    );
};

export default Register;
