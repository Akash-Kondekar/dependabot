import React, { useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid2 as Grid,
    IconButton,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { Close, FileUpload, PictureAsPdf } from "@mui/icons-material";
import studyProtocolStore from "../../state/store/studyProtocol";
import {
    ADD_NEW_STUDY_PROTOCOL_WARNING_HEADER_MSG,
    ADD_NEW_STUDY_PROTOCOL_WARNING_MSG,
    CHECKBOX_CONFRIMATION_MSG,
    CONTENT_TYPE_APPLICATION_PDF,
    STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH,
    STUDY_PROTOCOL_TITLE_MAXLENGTH,
} from "../../constants";
import { formatFileSize, getHTMLEncodedLength, getHTMLEncodedLengthDiff } from "../../utils";
import { useTheme } from "@emotion/react";
import { CheckBoxGroup } from "../Common";
import WarningBox from "../../componentsV2/Common/WarningBox";
import { orange } from "@mui/material/colors";

function AddProtocol({ onSuccess }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        file: null,
    });
    const [errors, setErrors] = useState({});
    const [agreed, setAgreed] = useState(false);
    const [fileError, setFileError] = useState("");
    const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
    const theme = useTheme();
    const fileInputRef = useRef(null); // Create a ref for the file input

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear error when user types
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

        if (!file) {
            return;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            setFileError(
                `File size exceeds 3MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`
            );
            return;
        }

        // Check file type
        if (file.type !== CONTENT_TYPE_APPLICATION_PDF) {
            setFileError("Only PDF files are accepted");
            return;
        }

        setFormData({
            ...formData,
            file,
        });
    };

    const handleFileUploadClick = () => {
        fileInputRef.current?.click(); // Use the ref to trigger click
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
        } else if (getHTMLEncodedLength(formData.title) > 255) {
            newErrors.title = "Title cannot exceed 255 characters";
        }

        if (formData.description && getHTMLEncodedLength(formData.description) > 1000) {
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

        const returnable = await studyProtocolStore.upload(data, false);
        if (returnable) {
            onSuccess();
            setAgreed(false);
        }
    };

    const backgroundColor = theme.palette.mode === "dark" ? "#ad68001f" : orange[50];

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            {errors.submit && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.submit}
                </Alert>
            )}
            <WarningBox
                sx={{ my: 2 }}
                headerText={ADD_NEW_STUDY_PROTOCOL_WARNING_HEADER_MSG}
                backgroundColor={backgroundColor}
            >
                <Typography
                    sx={{
                        color: theme.palette.grey.contrastText,
                    }}
                    variant="body2"
                >
                    {ADD_NEW_STUDY_PROTOCOL_WARNING_MSG}
                </Typography>
            </WarningBox>
            <Grid container spacing={3}>
                <Grid size={12}>
                    <TextField
                        required
                        fullWidth
                        id="title"
                        name="title"
                        label="Protocol Title"
                        value={formData.title}
                        onChange={handleInputChange}
                        error={
                            !!errors.title ||
                            getHTMLEncodedLength(formData.title) > STUDY_PROTOCOL_TITLE_MAXLENGTH
                        }
                        helperText={errors.title}
                        slotProps={{
                            input: {
                                inputProps: {
                                    maxLength:
                                        STUDY_PROTOCOL_TITLE_MAXLENGTH -
                                        getHTMLEncodedLengthDiff(formData.title),
                                },
                            },
                        }}
                    />
                    {getHTMLEncodedLength(formData.title) > 150 && (
                        <Typography
                            variant="caption"
                            color={
                                getHTMLEncodedLength(formData.title) >
                                STUDY_PROTOCOL_TITLE_MAXLENGTH
                                    ? "error.main"
                                    : "text.secondary"
                            }
                        >
                            {getHTMLEncodedLength(formData.title)}/{STUDY_PROTOCOL_TITLE_MAXLENGTH}{" "}
                            characters
                            {getHTMLEncodedLength(formData.title) >
                                STUDY_PROTOCOL_TITLE_MAXLENGTH && " (limit exceeded)"}
                        </Typography>
                    )}
                </Grid>

                <Grid size={12}>
                    <TextField
                        fullWidth
                        id="description"
                        name="description"
                        label="Description (Optional)"
                        value={formData.description}
                        onChange={handleInputChange}
                        error={!!errors.description}
                        helperText={errors.description}
                        multiline
                        rows={6}
                        slotProps={{
                            input: {
                                inputProps: {
                                    maxLength:
                                        STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH -
                                        -getHTMLEncodedLengthDiff(formData.description),
                                },
                            },
                        }}
                    />
                    {getHTMLEncodedLength(formData.description) > 800 && (
                        <Typography
                            variant="caption"
                            color={
                                getHTMLEncodedLength(formData.description) >
                                STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH
                                    ? "error.main"
                                    : "text.secondary"
                            }
                        >
                            {getHTMLEncodedLength(formData.description)}/
                            {STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH} characters
                            {getHTMLEncodedLength(formData.description) >
                                STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH && " (limit exceeded)"}
                        </Typography>
                    )}
                </Grid>

                <Grid size={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Upload PDF Protocol Document
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {!formData.file ? (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                textAlign: "center",
                                cursor: "pointer",
                                border: fileError
                                    ? `2px solid ${theme.palette.error.main}`
                                    : "1px dashed",
                                "&:hover": {
                                    backgroundColor: "action.hover",
                                    borderColor: "primary.main",
                                },
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
                            <FileUpload fontSize="large" color="primary" />
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                Click to upload a PDF file
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Maximum file size: 3MB
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
                                p: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
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
                </Grid>
            </Grid>
            <Box
                sx={{
                    mt: 2,
                }}
            >
                <CheckBoxGroup
                    checkboxData={[{ label: CHECKBOX_CONFRIMATION_MSG }]}
                    value={[agreed]}
                    handleOnChecked={e => setAgreed(e.target.checked)}
                />
            </Box>
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={
                        studyProtocolStore.loading ||
                        !(formData.file && formData.title) ||
                        !agreed ||
                        getHTMLEncodedLength(formData.title) > STUDY_PROTOCOL_TITLE_MAXLENGTH ||
                        getHTMLEncodedLength(formData.description) >
                            STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH
                    }
                    startIcon={studyProtocolStore.loading ? <CircularProgress size={20} /> : null}
                >
                    {studyProtocolStore.loading ? "Uploading..." : "Upload Protocol"}
                </Button>
            </Box>
        </Box>
    );
}

export default AddProtocol;
