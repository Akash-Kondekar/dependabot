import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { makeStyles } from "@mui/styles";
import {
    Stack,
    IconButton,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
} from "@mui/material";
import { Dropdown, Input, BasicButton, NoData } from "../../Common";
import { observer } from "mobx-react";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Users from "../../../state/store/admin/users";
import { filterEmptyValues, isValidEmail } from "../../../utils";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { ShowSuccess, ShowWarning } from "../../../componentsV2/Common/Toast";
import { Confirm } from "../../../componentsV2/Common/Confirm";

const useStyles = makeStyles(() => ({
    paper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
    },
    formControl: {
        textTransform: "capitalize",
    },
}));

const InviteUsers = observer(
    ({ action, setAction, listOfClients, setVisibility, USER_INVITE_ACTION }) => {
        const [users, setUsers] = React.useState([""]);
        const [selectedClient, setSelected] = React.useState("");
        const [file, setFile] = React.useState(null);

        const classes = useStyles();
        const currentTheme = useTheme();

        const theme = createTheme({
            palette: {
                mode: currentTheme.palette.mode,
            },
            components: {
                MuiMenuItem: {
                    styleOverrides: {
                        root: {
                            textTransform: "capitalize",
                        },
                    },
                },
                MuiOutlinedInput: {
                    styleOverrides: {
                        root: {
                            textTransform: "capitalize",
                        },
                    },
                },
            },
        });

        React.useEffect(() => {
            if (action === USER_INVITE_ACTION.INVITE) {
                setSelected("");
                setFile(null);
            } else {
                setSelected("");
                setUsers([""]);
            }
        }, [action]);

        const handleClose = () => {
            setAction(null);
        };

        const addUsersToInvite = (e, index) => {
            const { value } = e.target;
            const list = [...users];
            list[index] = value;

            setUsers(list);

            if (index === users.length - 1) {
                setUsers([...list, ""]);
            }

            if (list[index] === "") {
                list.splice(index + 1, 1);
                setUsers(list);
            }
        };

        const handleUserInvite = async () => {
            if (!selectedClient || selectedClient === "") {
                return ShowWarning("Please select a client");
            }

            if (action === USER_INVITE_ACTION.UPLOAD && file === null) {
                return ShowWarning("No file uploaded. Please upload a valid file.");
            }

            const currClient = listOfClients.find(cl => cl.value === selectedClient);

            let payload = [];
            let success = false;

            if (action === USER_INVITE_ACTION.UPLOAD) {
                const formData = new FormData();
                formData.append("file", file);

                payload = formData;

                //Reset uploaded results state before making API call
                Users.resetResults();

                success = await Users.invite(payload, currClient?.value, action);
                setAction(null);
            } else if (action === USER_INVITE_ACTION.INVITE) {
                const filteredEmails = filterEmptyValues(users);
                const inValidEmails = [];

                payload = [...new Set(filteredEmails)];

                if (filteredEmails.length === 0) {
                    return ShowWarning(
                        `Invite User(s) field cannot be empty. Please enter valid email Id(s)`
                    );
                }

                filteredEmails.map(email => {
                    !isValidEmail(email) && inValidEmails.push(email);
                });

                if (inValidEmails && inValidEmails.length > 0) {
                    return ShowWarning(
                        `Incorrect email(s) ${inValidEmails.toString()}. Please input email(s) in correct format, in lower case and try again`
                    );
                }

                //Reset uploaded results state before making API call
                Users.resetResults();

                success = await Users.invite(payload, currClient?.value, action);
                setAction(null);
            }

            if (success) {
                let message = "Request Submitted. ";
                const { invited, skipped, invalid } = Users.uploadedResults;
                if (invited?.length > 0) {
                    message = message.concat(`${invited?.length} User(s) Invited Successfully. `);
                }
                if (skipped?.length > 0) {
                    message = message.concat(
                        `${skipped?.length} User(s) Skipped. Please verify the email Id(s) `
                    );
                }
                if (invalid?.length > 0) {
                    message = message.concat(
                        `${invalid?.length} User(s) invalid. Please verify the email Id(s) `
                    );
                }
                if (skipped?.length > 0 && invalid?.length > 0) {
                    invited?.length === 0
                        ? (message = `No users invited. ${invalid?.length} User(s) invalid and ${skipped?.length} User(s) Skipped. Please verify the email Id(s)`)
                        : (message = `Request Submitted. ${invited?.length} User(s) Invited Successfully. ${invalid?.length} User(s) invalid and ${skipped?.length} User(s) Skipped. Please verify the email Id(s)`);
                }

                ShowSuccess(message);
                setVisibility(true);
            }
        };

        const handleChange = event => {
            const files = Array.from(event.target.files);
            const [file] = files;
            const fileType = file?.name?.split(".")?.pop();

            const allowedExtensions = /(csv|xls|xlsx)$/i;

            if (!allowedExtensions.exec(fileType)) {
                ShowWarning("Invalid file type. Allowed types are csv, xls, xlsx");

                //clear cached file name and set the state to initial value.
                event.target.value = null;
                setFile(null);
            } else {
                setFile(file);
            }
        };

        const handleDelete = async index => {
            const emptyField = users[index]?.trim().length === 0;

            const { isConfirmed } =
                !emptyField &&
                (await Confirm("Delete Email", "Are you sure you want to delete this email"));

            if (isConfirmed || emptyField) {
                const list = [...users];
                list[index] = "";

                list.splice(index, 1);
                setUsers(list);
            }
        };

        const hasActiveClients = listOfClients.length > 0;
        const userCount = users.length;

        return (
            <Dialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={action === USER_INVITE_ACTION.INVITE || action === USER_INVITE_ACTION.UPLOAD}
                fullWidth
                maxWidth="md"
                sx={{ alignItems: "center", textAlign: "center" }}
            >
                <DialogTitle sx={{ m: 0, p: 2 }}>
                    {action === USER_INVITE_ACTION.INVITE ? "Invite User(s)" : "Upload File"}
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: theme => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                {hasActiveClients && (
                    <span className={classes.paper}>
                        <DialogContent dividers sx={{ width: "100%" }}>
                            <Typography gutterBottom component="div">
                                <ThemeProvider theme={theme}>
                                    <Dropdown
                                        ddLabel="Client"
                                        labelName="Client"
                                        labelValue="Client"
                                        value={selectedClient}
                                        handleChange={e => setSelected(e.target.value)}
                                        dropdownOptions={listOfClients ?? []}
                                        sx={{ textAlign: "left" }}
                                    />
                                </ThemeProvider>
                                {action === USER_INVITE_ACTION.INVITE &&
                                    users.map((value, i) => (
                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            key={i}
                                            alignItems="center"
                                        >
                                            <Input
                                                key={i}
                                                name="user"
                                                label="Invite User(s)"
                                                placeholder="Enter email in lower case"
                                                value={value}
                                                onChange={e => addUsersToInvite(e, i)}
                                            />
                                            <Tooltip
                                                title={userCount > 1 ? "Delete Email" : ""}
                                                aria-label="Delete Email"
                                            >
                                                <IconButton
                                                    onClick={() => handleDelete(i)}
                                                    size="large"
                                                    disabled={userCount < 2}
                                                >
                                                    <DeleteOutline />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    ))}

                                {action === USER_INVITE_ACTION.UPLOAD && (
                                    <TextField
                                        name="File Upload"
                                        type="file"
                                        sx={{ mt: 2 }}
                                        onChange={handleChange}
                                        fullWidth
                                    />
                                )}
                            </Typography>
                        </DialogContent>
                    </span>
                )}
                {hasActiveClients && (
                    <DialogActions sx={{ p: 2 }}>
                        <Stack direction="row" spacing={2} width="100%" justifyContent="center">
                            <BasicButton
                                variant="outlined"
                                color="primary"
                                handleClick={handleClose}
                                buttonText="Cancel"
                            />
                            <BasicButton
                                variant="contained"
                                color="primary"
                                disabled={listOfClients.length === 0}
                                handleClick={() => handleUserInvite()}
                                buttonText={action !== null ? action : ""}
                            />
                        </Stack>
                    </DialogActions>
                )}

                {!hasActiveClients && <NoData message="No Active clients found." />}
            </Dialog>
        );
    }
);
export default InviteUsers;
