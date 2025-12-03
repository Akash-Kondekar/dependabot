import React from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { Cancel, DeleteOutline, Download, Edit, Save, Visibility } from "@mui/icons-material";
import { Confirm, DisplayAvatar } from "../Common";
import {
    decodeHTML,
    formatDate,
    formatFileSize,
    getHTMLEncodedLength,
    getHTMLEncodedLengthDiff,
    getPostgresqlSafeLength,
} from "../../utils";
import {
    STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH,
    STUDY_PROTOCOL_TITLE_MAXLENGTH,
} from "../../constants";
import session from "../../state/store/session";
import studyProtocolStore from "../../state/store/studyProtocol";

function ProtocolList({
    protocols,
    pagination,
    onPageChange,
    onDelete,
    detailsDialog,
    setDetailsDialog,
    editMode,
    setEditMode,
    editValues,
    setEditValues,
    handleSave,
}) {
    const handleViewDetails = protocol => {
        resetDetailsDialog();
        setEditValues({ title: protocol.title, description: protocol.description || "" });
        setDetailsDialog({ open: true, protocol });
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
            a.remove(); // Clean up the DOM
            window.URL.revokeObjectURL(url);
        }
    };

    const confirmDelete = async id => {
        const { isConfirmed } = await Confirm(
            `Archive Protocol`,
            "Confirm archive? You may not be able to do this if the protocol is linked to a study."
        );
        if (isConfirmed) {
            onDelete(id);
        }
    };

    const handleEditClick = field => {
        setEditMode({ ...editMode, [field]: true });
    };

    const handleInputChange = (field, value) => {
        setEditValues({ ...editValues, [field]: value });
    };

    function resetDetailsDialog() {
        setDetailsDialog({ open: false, protocol: null });
        setEditMode({ title: false, description: false });
    }

    const safeLength =
        getPostgresqlSafeLength(decodeHTML(editValues.description)) >
        getHTMLEncodedLength(decodeHTML(editValues.description))
            ? getPostgresqlSafeLength(decodeHTML(editValues.description))
            : getHTMLEncodedLength(decodeHTML(editValues.description));
    const isOverLimit = safeLength > STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH;

    return (
        <div>
            {protocols.length === 0 ? (
                <Card variant="outlined" sx={{ mb: 3, textAlign: "center", py: 4 }}>
                    <CardContent>
                        <Typography variant="h6" color="text.secondary">
                            No protocols found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Get started by adding a new protocol
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="subtitle2">Title</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2">File Name</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2">File Size</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2">Created at</Typography>
                                    </TableCell>
                                    {session.isAdmin && (
                                        <TableCell>
                                            <Typography variant="subtitle2">Created by</Typography>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Typography variant="subtitle2">Actions</Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {protocols?.map(protocol => (
                                    <TableRow key={protocol.id} hover>
                                        <TableCell
                                            sx={{
                                                wordBreak: "break-word",
                                                overflowWrap: "break-word",
                                                maxWidth: "500px",
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {decodeHTML(protocol.title)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                wordBreak: "break-word",
                                                overflowWrap: "break-word",
                                                maxWidth: "100px",
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {protocol.fileName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatFileSize(protocol.fileSize)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(protocol.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        {session.isAdmin && (
                                            <TableCell>
                                                <Tooltip title={protocol.userId}>
                                                    <div key={protocol.id}>
                                                        {protocol.userId && (
                                                            <DisplayAvatar
                                                                value={protocol.userId}
                                                                randomColor={true}
                                                                size={"small"}
                                                            />
                                                        )}
                                                    </div>
                                                </Tooltip>
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <Box sx={{ display: "flex" }}>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        onClick={() => handleViewDetails(protocol)}
                                                        size="small"
                                                    >
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {(session.isAdmin ||
                                                    session.loggedInUser === protocol?.userId) && (
                                                    <>
                                                        <Tooltip title="Download">
                                                            <IconButton
                                                                onClick={() =>
                                                                    handleDownload(
                                                                        protocol.id,
                                                                        protocol.fileName
                                                                    )
                                                                }
                                                                size="small"
                                                            >
                                                                <Download fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip
                                                            title={
                                                                protocol.deleted
                                                                    ? "Archived"
                                                                    : "Archive"
                                                            }
                                                        >
                                                            <div>
                                                                <IconButton
                                                                    disabled={protocol.deleted}
                                                                    onClick={() =>
                                                                        confirmDelete(protocol.id)
                                                                    }
                                                                    size="small"
                                                                    color="error"
                                                                >
                                                                    <DeleteOutline fontSize="small" />
                                                                </IconButton>
                                                            </div>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={pagination.totalElements}
                        page={pagination.page}
                        onPageChange={onPageChange}
                        rowsPerPage={pagination.size}
                        rowsPerPageOptions={[10]}
                    />
                </>
            )}
            {/* Protocol Details Dialog */}
            <Dialog open={detailsDialog.open} maxWidth="lg" fullWidth>
                {detailsDialog.protocol && (
                    <>
                        <DialogTitle>Protocol Details</DialogTitle>
                        <DialogContent>
                            {/* Editable Title */}
                            <Box
                                sx={{
                                    mb: 2,
                                    wordBreak: "break-word",
                                    overflowWrap: "break-word",
                                }}
                            >
                                <Typography variant="subtitle2" component="div" sx={{ mb: 0.5 }}>
                                    Title
                                </Typography>
                                {editMode.title ? (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            width: "100%",
                                        }}
                                    >
                                        <TextField
                                            autoFocus
                                            fullWidth
                                            variant="outlined"
                                            value={decodeHTML(editValues.title)}
                                            onChange={e =>
                                                handleInputChange("title", e.target.value)
                                            }
                                            slotProps={{
                                                input: {
                                                    inputProps: {
                                                        maxLength:
                                                            STUDY_PROTOCOL_TITLE_MAXLENGTH -
                                                            getHTMLEncodedLengthDiff(
                                                                decodeHTML(editValues.title)
                                                            ),
                                                    },
                                                },
                                            }}
                                            error={
                                                getHTMLEncodedLength(decodeHTML(editValues.title)) >
                                                STUDY_PROTOCOL_TITLE_MAXLENGTH
                                            }
                                        />
                                        <IconButton
                                            onClick={e => {
                                                e.preventDefault();
                                                setEditMode({ ...editMode, ["title"]: false });
                                                handleInputChange(
                                                    "title",
                                                    detailsDialog.protocol.title
                                                );
                                            }}
                                            color="error"
                                            sx={{ ml: 1 }}
                                        >
                                            <Cancel />
                                        </IconButton>
                                        <IconButton
                                            onClick={e => {
                                                e.preventDefault();
                                                handleSave();
                                            }}
                                            color="primary"
                                            sx={{ ml: 1 }}
                                            disabled={
                                                getHTMLEncodedLength(decodeHTML(editValues.title)) >
                                                STUDY_PROTOCOL_TITLE_MAXLENGTH
                                            }
                                        >
                                            <Save />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                                {decodeHTML(detailsDialog.protocol.title)}
                                            </Typography>
                                        </Box>
                                        {(session.isAdmin ||
                                            session.loggedInUser ===
                                                detailsDialog?.protocol?.userId) &&
                                            !detailsDialog?.protocol?.deleted && (
                                                <IconButton
                                                    onClick={() => handleEditClick("title")}
                                                    size="small"
                                                    color="primary"
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            )}
                                    </Box>
                                )}
                                {editMode.title &&
                                    editValues.title &&
                                    getHTMLEncodedLength(decodeHTML(editValues.title)) > 150 && (
                                        <Typography
                                            variant="caption"
                                            color={
                                                getHTMLEncodedLength(decodeHTML(editValues.title)) >
                                                STUDY_PROTOCOL_TITLE_MAXLENGTH
                                                    ? "error.main"
                                                    : "text.secondary"
                                            }
                                        >
                                            {getHTMLEncodedLength(decodeHTML(editValues.title))}/
                                            {STUDY_PROTOCOL_TITLE_MAXLENGTH} characters
                                            {getHTMLEncodedLength(decodeHTML(editValues.title)) >
                                                STUDY_PROTOCOL_TITLE_MAXLENGTH &&
                                                " (limit exceeded)"}
                                        </Typography>
                                    )}
                            </Box>

                            {/* Editable Description */}
                            <Box
                                sx={{ mb: 2, wordBreak: "break-word", overflowWrap: "break-word" }}
                            >
                                <Typography variant="subtitle2" component="div" sx={{ mb: 0.5 }}>
                                    Description
                                </Typography>
                                {editMode.description ? (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            width: "100%",
                                        }}
                                    >
                                        <TextField
                                            autoFocus
                                            fullWidth
                                            multiline
                                            variant="outlined"
                                            value={decodeHTML(editValues.description)}
                                            onChange={e =>
                                                handleInputChange("description", e.target.value)
                                            }
                                            slotProps={{
                                                input: {
                                                    inputProps: {
                                                        maxLength:
                                                            STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH -
                                                            getHTMLEncodedLengthDiff(
                                                                editValues.description
                                                            ),
                                                    },
                                                },
                                            }}
                                            error={
                                                getPostgresqlSafeLength(editValues.description) >
                                                STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH
                                            }
                                        />
                                        <Stack>
                                            <IconButton
                                                onClick={e => {
                                                    e.preventDefault();
                                                    setEditMode({
                                                        ...editMode,
                                                        ["description"]: false,
                                                    });
                                                    handleInputChange(
                                                        "description",
                                                        detailsDialog.protocol.description
                                                    );
                                                }}
                                                color="error"
                                                sx={{ ml: 1 }}
                                            >
                                                <Cancel />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleSave()}
                                                color="primary"
                                                sx={{ ml: 1, mt: 1 }}
                                                disabled={
                                                    getHTMLEncodedLength(
                                                        decodeHTML(editValues.description)
                                                    ) > STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH
                                                }
                                            >
                                                <Save />
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            {detailsDialog.protocol.description ? (
                                                <Typography variant="body1">
                                                    {decodeHTML(detailsDialog.protocol.description)}
                                                </Typography>
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontStyle: "italic" }}
                                                >
                                                    No description provided
                                                </Typography>
                                            )}
                                        </Box>
                                        {(session.isAdmin ||
                                            session.loggedInUser ===
                                                detailsDialog?.protocol?.userId) &&
                                            !detailsDialog?.protocol?.deleted && (
                                                <IconButton
                                                    onClick={() => handleEditClick("description")}
                                                    size="small"
                                                    color="primary"
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            )}
                                    </Box>
                                )}
                                {editMode.description &&
                                    editValues.description &&
                                    getHTMLEncodedLength(decodeHTML(editValues.description)) >
                                        800 && (
                                        <Typography
                                            variant="caption"
                                            color={isOverLimit ? "error" : "text.secondary"}
                                        >
                                            {safeLength}/{STUDY_PROTOCOL_DESCRIPTION_MAXLENGTH}{" "}
                                            characters
                                            {isOverLimit && " (limit exceeded)"}
                                        </Typography>
                                    )}
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" component="div" sx={{ mb: 0.5 }}>
                                    File Information
                                </Typography>
                                <Typography variant="body2">
                                    File Name: {detailsDialog.protocol.fileName}
                                </Typography>
                                <Typography variant="body2">
                                    File Size: {formatFileSize(detailsDialog.protocol.fileSize)}
                                </Typography>
                                <Typography variant="body2">
                                    Content Type: {detailsDialog.protocol.contentType}
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" component="div" sx={{ mb: 0.5 }}>
                                    Created by
                                </Typography>
                                <Typography variant="body2">
                                    {detailsDialog.protocol.userId}
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" component="div" sx={{ mb: 0.5 }}>
                                    Timestamps
                                </Typography>
                                <Typography variant="body2">
                                    Created: {formatDate(detailsDialog.protocol.createdAt)}
                                </Typography>
                                {detailsDialog.protocol.updatedAt && (
                                    <Typography variant="body2">
                                        Last Updated: {formatDate(detailsDialog.protocol.updatedAt)}
                                    </Typography>
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            {(session.isAdmin ||
                                session.loggedInUser === detailsDialog?.protocol?.userId) && (
                                <Button
                                    onClick={() =>
                                        handleDownload(
                                            detailsDialog.protocol.id,
                                            detailsDialog.protocol.fileName
                                        )
                                    }
                                    startIcon={<Download />}
                                >
                                    Download
                                </Button>
                            )}
                            <Button onClick={resetDetailsDialog}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </div>
    );
}

export default ProtocolList;
