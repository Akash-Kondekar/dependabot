import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Download from "@mui/icons-material/Download";
import Visibility from "@mui/icons-material/Visibility";
import { DisplayAvatar } from "./../Common/Avatar";
import { decodeHTML, formatDate } from "../../utils";
import session from "../../state/store/session";
import { useTheme } from "@emotion/react";
import { OperationTypeEnum } from "../../constants";
import { Divider } from "@mui/material";
import { Confirm } from "../Common/Confirm";

function ProtocolList({ protocols, pagination, onPageChange, handleUserClick }) {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const columnWidths = {
        title: session.isAdmin ? "35%" : "40%",
        fileName: session.isAdmin ? "30%" : "35%",
        createdAt: "10%",
        createdBy: session.isAdmin ? "10%" : "0%",
        actions: "15%",
    };

    const performUserClickOperation = (selectedOperationType, currProtocolObj) => {
        handleUserClick({
            // operationType is used to determine the type of operation to perform (Non-Empty field)
            operationType: selectedOperationType,
            // This object is used to pass various values/objects to parent file. (i.e. Based on our need, This object would have one or more properties under it. If we don't want to return any value/obj then just pass this object an null
            obj: {
                selectedProtocolObj: currProtocolObj,
            },
        });
    };

    const showConfirmationPopup = async selectedProtocolObj => {
        const { isConfirmed } = await Confirm(
            `Archive Protocol`,
            "Confirm archive? You may not be able to do this if the protocol is linked to a study."
        );
        if (isConfirmed) {
            performUserClickOperation(OperationTypeEnum.DELETE, selectedProtocolObj);
        }
    };

    return (
        <div style={{ marginTop: "40px" }}>
            {protocols.length === 0 ? (
                <Card variant="outlined" sx={{ mb: 3, textAlign: "center", py: 4 }}>
                    <CardContent sx={{ color: "text.secondary" }}>
                        <Typography variant="h6">No protocols found</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Get started by adding a new protocol
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {(() => {
                        return (
                            <>
                                <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                                    <Table
                                        sx={{
                                            borderCollapse: "collapse",
                                            border: "0px",
                                            tableLayout: "fixed",
                                            backgroundColor: isDarkMode
                                                ? "grey.main"
                                                : "grey.light",
                                        }}
                                    >
                                        <TableHead>
                                            <TableRow sx={{ borderBottom: "none" }}>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        borderBottom: "none",
                                                        width: columnWidths.title,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight={600}
                                                        color={theme.palette.grey.contrastText}
                                                        textAlign="center"
                                                        noWrap
                                                    >
                                                        Title
                                                    </Typography>
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        borderBottom: "none",
                                                        width: columnWidths.fileName,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight={600}
                                                        color={theme.palette.grey.contrastText}
                                                        textAlign="center"
                                                        noWrap
                                                    >
                                                        File name
                                                    </Typography>
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        borderBottom: "none",
                                                        width: columnWidths.createdAt,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight={600}
                                                        color={theme.palette.grey.contrastText}
                                                        textAlign="center"
                                                        noWrap
                                                    >
                                                        Created at
                                                    </Typography>
                                                </TableCell>
                                                {session.isAdmin && (
                                                    <TableCell
                                                        align="center"
                                                        sx={{
                                                            borderBottom: "none",
                                                            width: columnWidths.createdBy,
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body1"
                                                            fontWeight={600}
                                                            color={theme.palette.grey.contrastText}
                                                            textAlign="center"
                                                            noWrap
                                                        >
                                                            Created by
                                                        </Typography>
                                                    </TableCell>
                                                )}
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        borderBottom: "none",
                                                        width: columnWidths.actions,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight={600}
                                                        color={theme.palette.grey.contrastText}
                                                        textAlign="center"
                                                        noWrap
                                                    >
                                                        Actions
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {protocols?.map(protocol => (
                                                <TableRow
                                                    key={protocol.id}
                                                    hover
                                                    sx={{ borderBottom: "none" }}
                                                >
                                                    <TableCell
                                                        align="left"
                                                        sx={{
                                                            borderBottom: "none",
                                                            width: columnWidths.title,
                                                            maxWidth: "500px",
                                                        }}
                                                    >
                                                        <Tooltip
                                                            title={decodeHTML(protocol.title) || ""}
                                                            arrow
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={400}
                                                                noWrap
                                                                sx={{
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                    cursor: "default",
                                                                }}
                                                            >
                                                                {decodeHTML(protocol.title)}
                                                            </Typography>
                                                        </Tooltip>
                                                    </TableCell>

                                                    <TableCell
                                                        align="center"
                                                        sx={{
                                                            borderBottom: "none",
                                                            width: columnWidths.fileName,
                                                            maxWidth: "100px",
                                                        }}
                                                    >
                                                        <Tooltip
                                                            title={protocol.fileName || ""}
                                                            arrow
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={400}
                                                                color={
                                                                    theme.palette.grey.contrastText
                                                                }
                                                                noWrap
                                                                sx={{
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    cursor: "default",
                                                                }}
                                                            >
                                                                {protocol.fileName}
                                                            </Typography>
                                                        </Tooltip>
                                                    </TableCell>

                                                    <TableCell
                                                        align="center"
                                                        sx={{
                                                            borderBottom: "none",
                                                            width: columnWidths.createdAt,
                                                        }}
                                                    >
                                                        <Tooltip
                                                            title={formatDate(protocol.createdAt)}
                                                            arrow
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={400}
                                                                color={
                                                                    theme.palette.grey.contrastText
                                                                }
                                                                noWrap
                                                                sx={{
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    cursor: "default",
                                                                }}
                                                            >
                                                                {formatDate(protocol.createdAt)}
                                                            </Typography>
                                                        </Tooltip>
                                                    </TableCell>

                                                    {session.isAdmin && (
                                                        <TableCell
                                                            align="center"
                                                            sx={{
                                                                borderBottom: "none",
                                                                width: columnWidths.createdBy,
                                                            }}
                                                        >
                                                            <Tooltip title={protocol.userId} arrow>
                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        justifyContent: "center",
                                                                        width: "100%",
                                                                    }}
                                                                >
                                                                    {protocol.userId && (
                                                                        <DisplayAvatar
                                                                            value={protocol.userId.toUpperCase()}
                                                                            randomColor={true}
                                                                            size="small"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </Tooltip>
                                                        </TableCell>
                                                    )}

                                                    <TableCell
                                                        align="center"
                                                        sx={{
                                                            borderBottom: "none",
                                                            width: columnWidths.actions,
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                gap: 1,
                                                            }}
                                                        >
                                                            <Tooltip title="View Details">
                                                                <IconButton
                                                                    aria-label="View or Edit protocol"
                                                                    onClick={() =>
                                                                        performUserClickOperation(
                                                                            OperationTypeEnum.UPDATE,
                                                                            protocol
                                                                        )
                                                                    }
                                                                    size="small"
                                                                    sx={{ color: "text.secondary" }}
                                                                >
                                                                    <Visibility
                                                                        fontSize="small"
                                                                        sx={{
                                                                            color: isDarkMode
                                                                                ? "imageColor.main"
                                                                                : "grey.blackMetal",
                                                                        }}
                                                                    />
                                                                </IconButton>
                                                            </Tooltip>

                                                            {(session.isAdmin ||
                                                                session.loggedInUser ===
                                                                    protocol?.userId) && (
                                                                <>
                                                                    <Tooltip title="Download Protocol">
                                                                        <IconButton
                                                                            aria-label="Download protocol"
                                                                            onClick={() =>
                                                                                performUserClickOperation(
                                                                                    OperationTypeEnum.DOWNLOAD,
                                                                                    protocol
                                                                                )
                                                                            }
                                                                            size="small"
                                                                            sx={{
                                                                                color: "text.secondary",
                                                                            }}
                                                                        >
                                                                            <Download
                                                                                fontSize="small"
                                                                                sx={{
                                                                                    color: isDarkMode
                                                                                        ? "imageColor.main"
                                                                                        : "grey.blackMetal",
                                                                                }}
                                                                            />
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
                                                                                aria-label="Delete protocol"
                                                                                disabled={
                                                                                    protocol.deleted
                                                                                }
                                                                                onClick={() =>
                                                                                    showConfirmationPopup(
                                                                                        protocol
                                                                                    )
                                                                                }
                                                                                size="small"
                                                                            >
                                                                                <DeleteOutline
                                                                                    fontSize="small"
                                                                                    sx={{
                                                                                        color: isDarkMode
                                                                                            ? "imageColor.main"
                                                                                            : "grey.blackMetal",
                                                                                        opacity:
                                                                                            protocol.deleted
                                                                                                ? 0.5
                                                                                                : 1,
                                                                                    }}
                                                                                />
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

                                <Divider sx={{ my: 2 }}></Divider>
                                <TablePagination
                                    component="div"
                                    count={pagination.totalElements}
                                    page={pagination.page}
                                    onPageChange={onPageChange}
                                    rowsPerPage={pagination.size}
                                    rowsPerPageOptions={[10]}
                                />
                            </>
                        );
                    })()}
                </>
            )}
        </div>
    );
}

export default ProtocolList;
