import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { BasicButton } from "./../Common/BasicButton";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { Input } from "./../Common/Input";
import Typography from "@mui/material/Typography";
import Download from "@mui/icons-material/Download";
import Edit from "@mui/icons-material/Edit";
import Save from "@mui/icons-material/Save";
import Close from "@mui/icons-material/Close";
import {
    decodeHTML,
    formatDate,
    getFileSizeInHumanReadableFormat,
    getHTMLEncodedLength,
    getHTMLEncodedLengthDiff,
    getPostgresqlSafeLength,
} from "../../utils";
import {
    BUFFER_CHAR_LIMIT_FOR_MAX_CHAR_LENGTH_PROPS,
    OperationTypeEnum,
    STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH,
    STUDY_PROTOCOL_TITLE_MAXLENGTH,
} from "../../constants";
import session from "../../state/store/session";
import studyProtocolStore from "../../state/store/studyProtocol";
import { DisplayAvatar } from "../Common/Avatar";
import { useTheme } from "@mui/material";
import { DialogBox } from "../Common/DialogBox";
import Tooltip from "@mui/material/Tooltip";

function ViewOrEditProtocolDetails({ selectedProtocol, onClose }) {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    // Save into Local state to show updated values on post editing
    const [localSelectedProtocolCopy, setLocalProtocolCopy] = useState(selectedProtocol);
    const [allowEdits, setAllowEdits] = useState(false);
    const [editValues, setEditValues] = useState({ title: "", description: "" });

    const safeLengthForTitle = getPostgresqlSafeLength(editValues.title);
    const hasTitleLimitExceeded =
        safeLengthForTitle > STUDY_PROTOCOL_TITLE_MAXLENGTH ||
        getHTMLEncodedLength(decodeHTML(editValues.title)) > STUDY_PROTOCOL_TITLE_MAXLENGTH;

    const safeLengthForDesc =
        getPostgresqlSafeLength(decodeHTML(editValues.description)) >
        getHTMLEncodedLength(decodeHTML(editValues.description))
            ? getPostgresqlSafeLength(decodeHTML(editValues.description))
            : getHTMLEncodedLength(decodeHTML(editValues.description));
    const hasDescLimitExceeded = safeLengthForDesc > STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH;

    const fileInfoUIBlockToDisplay = [
        {
            label: "File name",
            value: localSelectedProtocolCopy.fileName,
        },
        {
            label: "File size",
            value: getFileSizeInHumanReadableFormat(
                localSelectedProtocolCopy.fileSize,
                true,
                false
            ),
        },
    ];

    const timeStampUIBlockToDisplay = [
        {
            label: "Created at",
            value: formatDate(localSelectedProtocolCopy.createdAt),
        },
        ...(localSelectedProtocolCopy.updatedAt
            ? [
                  {
                      label: "Last updated",
                      value: formatDate(localSelectedProtocolCopy.updatedAt),
                  },
              ]
            : []),
    ];

    useEffect(() => {
        setLocalProtocolCopy(selectedProtocol);
    }, [selectedProtocol]);

    const handleSave = async () => {
        if (localSelectedProtocolCopy) {
            const protocolToUpdate = {
                ...localSelectedProtocolCopy,
                title: editValues["title"],
                description: editValues["description"],
            };

            let responseObj = await studyProtocolStore.update(protocolToUpdate, true);
            if (responseObj) {
                // Update the latest protocol object
                setLocalProtocolCopy(responseObj);
                // Activate Exit edit mode again
                setAllowEdits(false);
            }
        }
    };

    const handleDownload = async (id, fileName) => {
        const content = await studyProtocolStore.download(id);
        if (content) {
            const url = window.URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        }
    };

    const handleEditClick = () => {
        setAllowEdits(true);
        setEditValues({
            title: localSelectedProtocolCopy.title,
            description: localSelectedProtocolCopy.description,
        });
    };

    const handleCancelEdit = () => {
        setAllowEdits(false);
        setEditValues({
            title: localSelectedProtocolCopy.title,
            description: localSelectedProtocolCopy.description,
        });
    };

    const handleInputChange = (field, value) => {
        setEditValues({ ...editValues, [field]: value });
    };

    const dialogContent = (
        <Box
            component="form"
            onSubmit={e => {
                e.preventDefault();
                if (allowEdits) {
                    handleSave();
                } else {
                    handleDownload(
                        localSelectedProtocolCopy.id,
                        localSelectedProtocolCopy.fileName
                    );
                }
            }}
        >
            <Box
                borderRadius={"16px"}
                sx={{
                    pt: 2,
                    mb: 3,
                    position: "relative",
                }}
            >
                <Stack spacing={2}>
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: isDarkMode ? "grey.main" : "grey.light",
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: isDarkMode ? "grey.light" : "grey.main",
                        }}
                    >
                        {allowEdits ? (
                            <>
                                <Input
                                    required
                                    autoFocus
                                    fullWidth
                                    label="Title"
                                    variant="outlined"
                                    value={decodeHTML(editValues.title)}
                                    onChange={e => handleInputChange("title", e.target.value)}
                                    slotProps={{
                                        input: {
                                            inputProps: {
                                                maxLength:
                                                    STUDY_PROTOCOL_TITLE_MAXLENGTH +
                                                    BUFFER_CHAR_LIMIT_FOR_MAX_CHAR_LENGTH_PROPS -
                                                    getHTMLEncodedLengthDiff(
                                                        decodeHTML(editValues.title)
                                                    ),
                                            },
                                        },
                                    }}
                                    error={hasTitleLimitExceeded}
                                />
                                {getHTMLEncodedLength(decodeHTML(editValues.title)) > 200 && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: hasTitleLimitExceeded
                                                ? "error.main"
                                                : theme.palette.grey.contrastText,
                                        }}
                                    >
                                        {getHTMLEncodedLength(decodeHTML(editValues.title))}/
                                        {STUDY_PROTOCOL_TITLE_MAXLENGTH} characters
                                        {hasTitleLimitExceeded && " (limit exceeded)"}
                                    </Typography>
                                )}
                                <Input
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Description (Optional)"
                                    variant="outlined"
                                    value={decodeHTML(editValues.description)}
                                    onChange={e => handleInputChange("description", e.target.value)}
                                    slotProps={{
                                        input: {
                                            inputProps: {
                                                maxLength:
                                                    STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH +
                                                    BUFFER_CHAR_LIMIT_FOR_MAX_CHAR_LENGTH_PROPS -
                                                    getHTMLEncodedLengthDiff(
                                                        decodeHTML(editValues.description)
                                                    ),
                                            },
                                        },
                                    }}
                                    error={hasDescLimitExceeded}
                                />
                                {getHTMLEncodedLength(decodeHTML(editValues.description)) > 800 && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: hasDescLimitExceeded
                                                ? "error.main"
                                                : theme.palette.grey.contrastText,
                                        }}
                                    >
                                        {safeLengthForDesc}/{STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH}{" "}
                                        characters
                                        {hasDescLimitExceeded && " (limit exceeded)"}
                                    </Typography>
                                )}
                            </>
                        ) : (
                            <>
                                <Typography
                                    variant="body1"
                                    fontWeight={600}
                                    color={theme.palette.grey.contrastText}
                                    sx={{
                                        lineHeight: "1",
                                        letterSpacing: "-0.16px",
                                        wordBreak: "break-word",
                                        whiteSpace: "pre-wrap",
                                        paddingRight: 2,
                                    }}
                                >
                                    {decodeHTML(localSelectedProtocolCopy.title)}
                                </Typography>

                                <Typography
                                    variant="body1"
                                    fontWeight={400}
                                    color={theme.palette.grey.contrastText}
                                    mt={1}
                                    sx={{
                                        lineHeight: "1",
                                        letterSpacing: "-0.16px",
                                        wordBreak: "break-word",
                                        whiteSpace: "pre-wrap",
                                        fontStyle: localSelectedProtocolCopy.description
                                            ? "normal"
                                            : "italic",
                                    }}
                                >
                                    {localSelectedProtocolCopy.description
                                        ? decodeHTML(localSelectedProtocolCopy.description)
                                        : "No description provided"}
                                </Typography>
                            </>
                        )}
                    </Box>
                </Stack>

                {(session.isAdmin || session.loggedInUser === localSelectedProtocolCopy?.userId) &&
                    !localSelectedProtocolCopy?.deleted && (
                        <IconButton
                            onClick={() => (allowEdits ? handleCancelEdit() : handleEditClick())}
                            sx={{ position: "absolute", top: 20, right: 8 }}
                            size="small"
                            color="primary"
                        >
                            {allowEdits ? (
                                <Close
                                    fontSize="small"
                                    sx={{
                                        color: theme.palette.grey.contrastText,
                                    }}
                                />
                            ) : (
                                <Edit
                                    fontSize="small"
                                    sx={{
                                        color: theme.palette.grey.contrastText,
                                    }}
                                />
                            )}
                        </IconButton>
                    )}
            </Box>

            <Box
                borderRadius={"16px"}
                sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: isDarkMode ? "grey.main" : "grey.light",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: isDarkMode ? "grey.light" : "grey.main",
                }}
            >
                <Typography
                    variant="body1"
                    fontWeight={600}
                    color={theme.palette.grey.contrastText}
                    mb={3}
                    sx={{
                        lineHeight: "1",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    File Information
                </Typography>

                {fileInfoUIBlockToDisplay.map(({ label, value }) => (
                    <Stack
                        key={label}
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        sx={{ wordBreak: "break-word", fontSize: "14px" }}
                    >
                        <Typography
                            variant="body2"
                            fontWeight={600}
                            color={theme.palette.grey.contrastText}
                        >
                            {label}:
                        </Typography>
                        <Typography
                            variant="body2"
                            fontWeight={500}
                            color={theme.palette.grey.contrastText}
                        >
                            {value}
                        </Typography>
                    </Stack>
                ))}

                <Typography
                    variant="body1"
                    fontWeight={600}
                    color={theme.palette.grey.contrastText}
                    mt={3}
                    mb={2}
                    sx={{
                        lineHeight: "1",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    Created by
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <DisplayAvatar
                        value={localSelectedProtocolCopy.userId.toUpperCase()}
                        randomColor={true}
                        size="small"
                    />
                    <Typography
                        variant="body2"
                        fontWeight={300}
                        color={theme.palette.grey.contrastText}
                    >
                        {localSelectedProtocolCopy.userId}
                    </Typography>
                </Stack>

                <Typography
                    variant="body1"
                    fontWeight={600}
                    color={theme.palette.grey.contrastText}
                    mt={3}
                    mb={2}
                    sx={{
                        lineHeight: "1",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    Timestamps
                </Typography>

                {timeStampUIBlockToDisplay.map(({ label, value }) => (
                    <Stack
                        key={label}
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        sx={{ wordBreak: "break-word" }}
                    >
                        <Typography
                            variant="body2"
                            fontWeight={600}
                            color={theme.palette.grey.contrastText}
                        >
                            {label}:
                        </Typography>
                        <Typography
                            variant="body2"
                            fontWeight={400}
                            color={theme.palette.grey.contrastText}
                        >
                            {value}
                        </Typography>
                    </Stack>
                ))}
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                <Tooltip title={"Close"} arrow>
                    <BasicButton
                        variant="outlined"
                        onClick={() => onClose({ operationType: OperationTypeEnum.UPDATE })}
                        sx={{
                            textTransform: "none",
                            px: 3,
                            py: 1,
                            borderRadius: 1.5,
                        }}
                        buttonText={"Close"}
                    />
                </Tooltip>

                {(session.isAdmin ||
                    session.loggedInUser === localSelectedProtocolCopy?.userId) && (
                    <Tooltip title={allowEdits ? "Save" : "Download Protocol"} arrow>
                        <BasicButton
                            type="submit"
                            variant="contained"
                            disabled={allowEdits && (hasTitleLimitExceeded || hasDescLimitExceeded)}
                            startIcon={allowEdits ? <Save /> : <Download />}
                            sx={{
                                textTransform: "none",
                                px: 3,
                                py: 1,
                                borderRadius: 1.5,
                            }}
                            buttonText={allowEdits ? "Save" : "Download"}
                            handleClick={() => {}}
                        />
                    </Tooltip>
                )}
            </Stack>
        </Box>
    );

    return (
        <DialogBox
            showHeaderCloseBtn={false}
            open={true}
            handleClose={(event, reason) => {
                if (reason !== "backdropClick") {
                    onClose({ operationType: OperationTypeEnum.UPDATE });
                }
            }}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown
            title="Protocol Details"
            Content={dialogContent}
        />
    );
}

export default ViewOrEditProtocolDetails;
