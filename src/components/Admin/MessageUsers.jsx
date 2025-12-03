import React, { useMemo } from "react";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import makeStyles from "@mui/styles/makeStyles";
import { Button } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {
    adminBroadcastColumnCreatedOn,
    adminBroadcastMessagesTableHeader,
    baseMRTOptions,
    messageSeverity,
} from "../../constants";
import { formatDate, formatDateFieldAndAddSlNo } from "../../utils";
import { Dropdown, Input } from "../Common";
import broadcast from "../../state/store/admin/broadcast";
import { observer } from "mobx-react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { DeleteOutline } from "@mui/icons-material";
import session from "../../state/store/session";
import { MaterialReactTable } from "material-react-table";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import enLocale from "date-fns/locale/en-GB";
import { MRTDataTableTitle } from "../Common/MRTDataTableTitle.jsx";
import { ShowSuccess, ShowWarning } from "../../componentsV2/Common/Toast";

const MESSAGE_STATUS = {
    DELETED: 0,
    ACTIVE: 1,
};

const DEFAULT_SEV_HIGH = "1";
const MAX_CHARACTER_LIMIT = 250;

export const DisplayExistingMessages = observer(({ messages }) => {
    // Removed type annotation

    const processedData = useMemo(
        () => formatDateFieldAndAddSlNo(messages, adminBroadcastColumnCreatedOn), // Assuming adminBroadcastColumnCreatedOn is 'createdOn'
        [messages]
    );

    const columns = useMemo(
        () => [
            {
                header: "Sl No",
                accessorKey: "slNo",
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                maxSize: 30,
            },
            { header: "Severity", accessorKey: "severity", size: 20 },
            {
                header: "Message Summary",
                accessorKey: "messageSummary",
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                size: 250,
                Cell: ({ cell }) => {
                    const summary = cell.getValue() || ""; // Handle potential null/undefined
                    return (
                        <Tooltip title={summary} placement="top">
                            <Box
                                sx={{
                                    maxWidth: MAX_CHARACTER_LIMIT, // Set max width
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {summary}
                            </Box>
                        </Tooltip>
                    );
                },
            },
            {
                header: "Status",
                accessorKey: "statusDescription",
                size: 20,
                filterVariant: "select",
            }, // Display formatted status
            { header: "Added By", accessorKey: "createdByUserFullName" },
            {
                header: "Added On",
                accessorFn: originalRow => new Date(originalRow.createdOn),
                accessorKey: "createdOn",
                filterVariant: "date-range",
                Cell: ({ cell }) => formatDate(cell.getValue()),
            },
            {
                header: "Actions",
                accessorKey: "actions",
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                size: 20,
                Cell: ({ row }) => {
                    const rowData = row.original;
                    // Ensure MESSAGE_STATUS.DELETED exists and comparison works
                    const deleted = rowData?.status === MESSAGE_STATUS?.DELETED;
                    return (
                        // These outer parentheses for a multi-line return are fine
                        // The erroneous curly braces around the ternary operator have been removed
                        deleted === true ? (
                            ""
                        ) : (
                            <Tooltip title={"Delete message"} aria-label="Delete message">
                                <span>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={async () => {
                                            await broadcast.removeMessage(rowData.messageID);
                                            ShowSuccess("Message Deleted");
                                        }}
                                        disabled={!session?.isAdmin || deleted}
                                    >
                                        <DeleteOutline fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )
                    );
                },
            },
        ],
        [] // dependencies if session/broadcast/constants change
    );

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enLocale}>
            <MaterialReactTable
                columns={columns}
                data={processedData}
                enableColumnFilters={processedData?.length > 0}
                enableSorting={processedData?.length > 0}
                enableColumnActions={processedData?.length > 0}
                showGlobalFilter={processedData?.length > 0}
                {...baseMRTOptions}
                renderTopToolbarCustomActions={() => {
                    return <MRTDataTableTitle title={adminBroadcastMessagesTableHeader} />;
                }}
            />
        </LocalizationProvider>
    );
});

export const MessageUsers = observer(() => {
    React.useEffect(() => {
        broadcast.loadAdmin();
    }, []);

    return (
        <div>
            <SendMessageForm />
            <DisplayExistingMessages messages={broadcast.messagesAdmin} />
        </div>
    );
});

const useStyles = makeStyles(theme => ({
    paper: {
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
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

export function SendMessageForm() {
    const [messageSummary, setMessageSummary] = React.useState("");
    const [messageDetails, setMessageDetails] = React.useState("");
    const [severity, setSeverity] = React.useState(DEFAULT_SEV_HIGH);

    const handleChange = event => {
        setSeverity(event.target.value);
    };

    const resetForm = () => {
        setMessageSummary("");
        setMessageDetails("");
        setSeverity(DEFAULT_SEV_HIGH);
    };

    const classes = useStyles();

    const saveDetails = async e => {
        e.preventDefault();

        if (messageSummary.trim() === "") {
            return ShowWarning("Please provide message summary");
        }

        if (messageDetails.trim() === "") {
            return ShowWarning("Please provide message details");
        }

        const data = {
            messageSummary: messageSummary,
            messageDetails: messageDetails,
            status: "1",
            severity: severity,
        };

        const result = await broadcast.save(data);

        if (result === true) {
            ShowSuccess("Message Added Successfully");
            resetForm();
        } else {
            ShowWarning("Something Went Wrong");
        }
    };

    const SUMMARY_TEXT_LENGTH = 255;
    const DESCRIPTION_TEXT_LENGTH = 500;

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <AddAlertIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Broadcast Message
                </Typography>
                <Input
                    name="Summary"
                    label="Summary"
                    value={messageSummary}
                    onChange={e => {
                        setMessageSummary(e.target.value);
                    }}
                    inputProps={{ maxLength: SUMMARY_TEXT_LENGTH }}
                />
                {messageSummary.length > SUMMARY_TEXT_LENGTH - 55 && (
                    <div
                        style={{
                            fontSize: "smaller",
                            textAlign: "right",
                            width: "100%",
                        }}
                    >
                        {messageSummary.length}/{SUMMARY_TEXT_LENGTH}
                    </div>
                )}
                <Input
                    name="Details"
                    label="Details"
                    value={messageDetails}
                    onChange={e => {
                        setMessageDetails(e.target.value);
                    }}
                    inputProps={{ maxLength: DESCRIPTION_TEXT_LENGTH }}
                    multiline={true}
                    rows={4}
                />
                {messageDetails.length > DESCRIPTION_TEXT_LENGTH - 100 && (
                    <div
                        style={{
                            fontSize: "smaller",
                            textAlign: "right",
                            width: "100%",
                            paddingBottom: "10px",
                        }}
                    >
                        {messageDetails.length}/{DESCRIPTION_TEXT_LENGTH}
                    </div>
                )}

                <Dropdown
                    ddLabel="Severity"
                    labelName="Severity"
                    labelValue="Severity"
                    value={severity}
                    handleChange={e => handleChange(e)}
                    dropdownOptions={messageSeverity}
                />
                <Button
                    onClick={e => {
                        saveDetails(e);
                    }}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                >
                    Send Message
                </Button>
            </div>
        </Container>
    );
}
