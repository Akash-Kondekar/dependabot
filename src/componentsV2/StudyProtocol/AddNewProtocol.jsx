import React, { useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { Input } from "./../Common/Input";
import { BasicButton } from "./../Common/BasicButton";
import { DialogBox } from "./../Common/DialogBox";
import Typography from "@mui/material/Typography";
import Close from "@mui/icons-material/Close";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import studyProtocolStore from "../../state/store/studyProtocol";
import {
    ADD_NEW_STUDY_PROTOCOL_WARNING_HEADER_MSG,
    ADD_NEW_STUDY_PROTOCOL_WARNING_MSG,
    BUFFER_CHAR_LIMIT_FOR_MAX_CHAR_LENGTH_PROPS,
    CHECKBOX_CONFRIMATION_MSG,
    CONTENT_TYPE_APPLICATION_PDF,
    OperationTypeEnum,
    STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH,
    STUDY_PROTOCOL_TITLE_MAXLENGTH,
} from "../../constants";
import { formatFileSize, getHTMLEncodedLength, getHTMLEncodedLengthDiff } from "../../utils";
import { useTheme } from "@emotion/react";
import { Tooltip } from "@mui/material";
import Upload from "@mui/icons-material/Upload";
import WarningBox from "../Common/WarningBox";
import { CheckBoxGroup } from "../Common/CheckBoxGroup";

function AddNewProtocol({ onClose, title = "Add New Protocol" }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        file: null,
    });
    const [errors, setErrors] = useState({});
    const [fileError, setFileError] = useState("");
    const [agreed, setAgreed] = useState(false);
    const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
    const theme = useTheme();
    const fileInputRef = useRef(null);
    const isDarkMode = theme.palette.mode === "dark";

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    const handleFileChange = e => {
        const file = e.target?.files[0];
        setFileError("");

        // To resolve the issue where the onChange event does not trigger when the user uploads the same file again
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setFileError(
                `File size exceeds. (Current File Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`
            );
            resetFileUploadError();
            return;
        }

        if (file.type !== CONTENT_TYPE_APPLICATION_PDF) {
            setFileError("Only PDF files are accepted");
            resetFileUploadError();
            return;
        }

        setFormData({
            ...formData,
            file,
        });
    };

    const resetFileUploadError = () => {
        // Reset Error and UI after 3 Seconds
        setTimeout(() => {
            setFileError("");
        }, 3000);
    };

    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const clearFile = () => {
        setFormData({
            ...formData,
            file: null,
        });
        setFileError("");
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title?.trim()) {
            newErrors.title = "Title is required";
        } else if (getHTMLEncodedLength(formData.title) > STUDY_PROTOCOL_TITLE_MAXLENGTH) {
            newErrors.title = "Title cannot exceed 255 characters";
        }

        if (
            formData.description &&
            getHTMLEncodedLength(formData.description) > STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH
        ) {
            newErrors.description = "Description cannot exceed 1000 characters";
        }

        if (!formData.file) {
            setFileError("Please select a PDF file");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && !fileError;
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const data = new FormData();
        data.append("file", formData.file);
        data.append("title", formData.title);
        if (formData.description) {
            data.append("description", formData.description);
        }

        const returnable = await studyProtocolStore.upload(data, true);
        if (returnable) {
            onClose({ operationType: OperationTypeEnum.ADD });
        }
    };

    const isTitleOverLimit = getHTMLEncodedLength(formData.title) > STUDY_PROTOCOL_TITLE_MAXLENGTH;
    const isDescriptionOverLimit =
        getHTMLEncodedLength(formData.description) > STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH;

    const dialogContent = (
        <Box component="form" onSubmit={handleSubmit}>
            {errors.submit && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.submit}
                </Alert>
            )}
            <WarningBox
                sx={{ mt: 2 }}
                headerText={ADD_NEW_STUDY_PROTOCOL_WARNING_HEADER_MSG}
                backgroundColor={theme.palette.customWarning.main}
            >
                <Typography variant="body2">{ADD_NEW_STUDY_PROTOCOL_WARNING_MSG}</Typography>
            </WarningBox>
            <Box>
                <Input
                    required
                    fullWidth
                    id="title"
                    name="title"
                    label="Title"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={!!errors.title || isTitleOverLimit}
                    helperText={errors.title}
                    slotProps={{
                        input: {
                            inputProps: {
                                maxLength:
                                    STUDY_PROTOCOL_TITLE_MAXLENGTH +
                                    BUFFER_CHAR_LIMIT_FOR_MAX_CHAR_LENGTH_PROPS -
                                    getHTMLEncodedLengthDiff(formData.title),
                            },
                        },
                    }}
                />
                {getHTMLEncodedLength(formData.title) > 200 && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: isTitleOverLimit ? "error.main" : "text.secondary",
                        }}
                    >
                        {getHTMLEncodedLength(formData.title)}/{STUDY_PROTOCOL_TITLE_MAXLENGTH}{" "}
                        characters
                        {isTitleOverLimit && " (limit exceeded)"}
                    </Typography>
                )}
                <Input
                    fullWidth
                    id="description"
                    name="description"
                    label="Description (Optional)"
                    value={formData.description}
                    onChange={handleInputChange}
                    error={!!errors.description || isDescriptionOverLimit}
                    helperText={errors.description}
                    multiline
                    rows={4}
                    slotProps={{
                        input: {
                            inputProps: {
                                maxLength:
                                    STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH +
                                    BUFFER_CHAR_LIMIT_FOR_MAX_CHAR_LENGTH_PROPS -
                                    getHTMLEncodedLengthDiff(formData.description),
                            },
                        },
                    }}
                />
                {getHTMLEncodedLength(formData.description) > 800 && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: isDescriptionOverLimit ? "error.main" : "text.secondary",
                        }}
                    >
                        {getHTMLEncodedLength(formData.description)}/
                        {STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH} characters
                        {isDescriptionOverLimit && " (limit exceeded)"}
                    </Typography>
                )}
                {!formData.file ? (
                    <Paper
                        variant="outlined"
                        sx={{
                            mt: 2,
                            p: 3,
                            textAlign: "center",
                            cursor: "pointer",
                            border: fileError
                                ? `2px solid ${theme.palette.error.main}`
                                : "1px dashed",
                            backgroundColor: "transparent",
                        }}
                        onClick={handleFileUploadClick}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept={CONTENT_TYPE_APPLICATION_PDF}
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <Stack
                            alignItems="center"
                            spacing={1}
                            direction="row"
                            justifyContent={"center"}
                        >
                            <PictureAsPdfOutlinedIcon
                                fontSize="medium"
                                sx={{
                                    fontSize: "20px",
                                    fontWeight: 600,
                                    color: fileError
                                        ? `${theme.palette.error.main}`
                                        : isDarkMode
                                          ? "imageColor.main"
                                          : "grey.blackMetal",
                                }}
                            />
                            <Typography
                                variant="body1"
                                fontWeight={600}
                                color={
                                    fileError
                                        ? theme.palette.error.main
                                        : isDarkMode
                                          ? "imageColor.main"
                                          : "grey.blackMetal"
                                }
                                mt={1}
                            >
                                Upload protocol (.pdf only)
                            </Typography>
                        </Stack>
                        <Typography
                            variant="body2"
                            fontWeight={400}
                            color={
                                fileError
                                    ? theme.palette.error.main
                                    : theme.palette.grey.contrastText
                            }
                            pt={2}
                        >
                            Click to upload.
                            <br />
                            Maximum file size: 3 MB.
                        </Typography>

                        {fileError && (
                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                {fileError}
                            </Typography>
                        )}
                    </Paper>
                ) : (
                    <Paper
                        variant="outlined"
                        sx={{
                            mt: 2,
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "transparent",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <PictureAsPdf color="error" sx={{ mr: 2 }} />
                            <Box>
                                <Typography variant="body1" noWrap sx={{ maxWidth: 300 }}>
                                    {formData.file?.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatFileSize(formData.file?.size)}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={clearFile} size="small">
                            <Close fontSize="small" />
                        </IconButton>
                    </Paper>
                )}
            </Box>
            <Box sx={{ mt: 2 }}>
                <CheckBoxGroup
                    checkboxData={[{ label: CHECKBOX_CONFRIMATION_MSG }]}
                    value={[agreed]}
                    handleOnChecked={e => setAgreed(e.target.checked)}
                />
            </Box>
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                <Tooltip title={"Close"} arrow>
                    <BasicButton
                        variant="outlined"
                        onClick={() => onClose({ operationType: OperationTypeEnum.ADD })}
                        sx={{
                            textTransform: "none",
                            px: 3,
                            py: 1,
                            borderRadius: 1.5,
                        }}
                        buttonText={"Close"}
                    />
                </Tooltip>
                <Tooltip
                    title={studyProtocolStore.loading ? "Uploading..." : "Upload Protocol"}
                    arrow
                >
                    <BasicButton
                        type="submit"
                        variant="contained"
                        disabled={
                            studyProtocolStore.loading ||
                            !(formData.file && formData.title) ||
                            isTitleOverLimit ||
                            isDescriptionOverLimit ||
                            !agreed
                        }
                        sx={{
                            textTransform: "none",
                            px: 3,
                            py: 1,
                            borderRadius: 1.5,
                        }}
                        buttonText={studyProtocolStore.loading ? "Uploading..." : "Upload Protocol"}
                        startIcon={
                            studyProtocolStore.loading ? <CircularProgress size={20} /> : <Upload />
                        }
                        handleClick={() => {}}
                    />
                </Tooltip>
            </Stack>
        </Box>
    );

    return (
        <DialogBox
            open={true}
            showHeaderCloseBtn={false}
            handleClose={(event, reason) => {
                if (reason !== "backdropClick") {
                    onClose({ operationType: OperationTypeEnum.ADD });
                }
            }}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown
            title={title}
            Content={dialogContent}
        />
    );
}

export default AddNewProtocol;
