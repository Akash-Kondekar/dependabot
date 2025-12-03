import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";

import makeStyles from "@mui/styles/makeStyles";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Grid2 as Grid,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import { BasicButton } from "../../Common";
import { useLocation, useNavigate } from "react-router-dom";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import medicalStore from "../../../state/store/codebuilder/medical";
import drugStore from "../../../state/store/codebuilder/drugs";
import { formatDate } from "../../../utils";
import session from "../../../state/store/session";
import {
    CODE_BUILDER_TYPE,
    DATE_TIME_FORMAT,
    DRUG_CODELIST_DOCUMENTATION_TEMPLATE,
    GetIconForThisCodeStatus,
    MEDICAL_CODELIST_DOCUMENTATION_TEMPLATE,
    PHENOTYPE_STATE,
} from "../../../constants";
import Stack from "@mui/material/Stack";
import { columnsForMedicalCodes, optionsForLoadedCodesTable } from "../Medical/table-data";

import { columnsForDrugCodes } from "../Drugs/table-data";
import MUIDataTable from "mui-datatables";
import RichTextDocumentationEditor from "../Common/RichTextDocumentationEditor";
import { AutocompleteUserTags } from "../Common/AutoCompleteUserTags";
import SaveIcon from "@mui/icons-material/Save";
import { ArrowBack, CancelOutlined, CheckCircleOutline } from "@mui/icons-material";
import { DisplayDialogue } from "../Common/DisplayDialogue";
import { ShowError } from "../../../componentsV2/Common/Toast";
import { Confirm } from "../../../componentsV2/Common/Confirm";
import Badge from "@mui/material/Badge";
import GradeIcon from "@mui/icons-material/Grade";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined";

const useStyles = makeStyles(() => ({
    box: {
        margin: "0px 20px",
    },

    bolderFont: {
        fontWeight: "600",
        fontSize: "medium",
    },
    margin: {
        margin: "5px",
    },
    versionStyle: {
        margin: "0px 10px",
        listStyle: "none",
        fontSize: "0.9rem",
        color: "grey",
    },
    ellipses: {
        textAlign: "center",
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
}));

const ViewCodes = observer(() => {
    const location = useLocation();
    const navigate = useNavigate();
    const drugs = location?.pathname?.indexOf(CODE_BUILDER_TYPE.DRUG) !== -1;

    const { box, bolderFont, margin, ellipses } = useStyles();

    // The view component is same for both drugs and medical.
    // For this reason, the store is conditionally selected below!
    // Need to maintain same naming conventions and method names in both stores.
    const store = drugs ? drugStore : medicalStore;
    const columns = drugs ? columnsForDrugCodes : columnsForMedicalCodes;

    const [editTags, setEditTags] = useState(false);
    const [editDocumentation, setEditDocumentation] = useState(false);
    const {
        id = undefined,
        name,
        owner,
        ownerName,
        createdOn,
        modifiedOn,
        modifiedBy,
        dbNames,
        tags,
        status,
        reviewer,
        approvedBy,
        approvedOn,
        favoritedByUser,
        favoriteCount,
    } = store.codeToView;

    const [searchTerm, setSearchTerm] = useState("");
    const [userTagAutoCompleteOptions, setUserTagAutoCompleteOptions] = useState([]);
    const [selectedUserTags, setSelectedUserTags] = useState(() => (tags ? tags : []));

    const [richTextContent, setRichTextContent] = useState(() =>
        store.richTextContentInLibrary !== undefined ? store.richTextContentInLibrary : ""
    );
    const handleChange = e => {
        setSearchTerm(e.target.value);
    };

    React.useEffect(() => {
        // If there is no id, re-direct users back to library.
        if (!id) {
            handleBack();
        }
    }, []);

    function handleUserTagChange(value) {
        if (Array.isArray(value)) {
            setSelectedUserTags(value);
        } else {
            setSelectedUserTags([...selectedUserTags, value]);
        }
    }

    const handleCreateNewUserTag = async (e, value, reason) => {
        let payload;
        if (reason === "selectOption") {
            // If value is an array, take the first item
            payload = Array.isArray(value) ? value[0] : value;
        } else {
            payload = e.target.value;
        }
        if (payload.length > 0 && payload.length < 50) {
            const autoCompleteOptions = await store.saveNewUserTag(payload);
            autoCompleteOptions &&
                setUserTagAutoCompleteOptions([...userTagAutoCompleteOptions, autoCompleteOptions]);
            handleUserTagChange(payload);
        } else {
            ShowError("tag length is too long");
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(async () => {
            const autoCompleteOptions = await store.searchUserTagLookup(searchTerm);
            autoCompleteOptions && setUserTagAutoCompleteOptions(autoCompleteOptions);
        }, 700);
        return () => {
            clearTimeout(debounceTimer);
        };
    }, [searchTerm]);

    const handleBack = () => {
        const qs = drugs ? `?tab=${CODE_BUILDER_TYPE.DRUG}` : "";
        const path = "/builder" + qs;

        navigate(path, { state: { title: "Library" } });
    };

    const onEdit = async () => {
        let confirmationMsg = `This will overwrite your workspace with details from ${name}. Continue?`;
        if (status === PHENOTYPE_STATE.PUBLIC_RELEASE || status === PHENOTYPE_STATE.APPROVED) {
            confirmationMsg = `This will overwrite your workspace with details from ${name}. It will also reset status back to draft. Continue?`;
        }

        const { isConfirmed } = await Confirm(`Edit ${name}`, confirmationMsg);
        if (isConfirmed) {
            store.setCodeDetailsToEdit(name, id);
            const type = drugs ? "drugs" : "medical"; // This refers to the path defined in routes!
            navigate(`/builder/${type}`);
        }
    };

    const onDelete = async () => {
        const { isConfirmed } = await Confirm("Confirm", "Are you sure you want to remove this?");
        if (isConfirmed) {
            await store.delete(id);
            handleBack();
        }
    };

    React.useEffect(() => {
        const getCodesToView = async () => {
            if (id) {
                await store.load(id, true); // true: So that we update setMasterCodeListForView and not setMasterCodeList
            }
        };
        getCodesToView(id);
    }, []);

    const canAction = session.isAdmin || owner?.indexOf(session.loggedInUser) !== -1;
    const canRelease =
        (session.isAdmin || session.loggedInUser === owner) && status === PHENOTYPE_STATE.APPROVED;
    const canApprove =
        status === PHENOTYPE_STATE.UNDER_REVIEW &&
        (session.isAdmin || reviewer === session.loggedInUser);

    const hasStatus = status && status !== "";

    const canShare =
        status === PHENOTYPE_STATE.DRAFT && (session.loggedInUser === owner || session.isAdmin);

    const updateTags = async () => {
        const payload = {
            id: id,
            filename: name,
            finalData: [],
            tags: selectedUserTags,
            document: undefined,
            userId: owner,
            status: status,
            reviewer: reviewer,
        };
        await store.update(payload);
        setEditTags(false);
    };

    const cancelEditTags = () => {
        setSelectedUserTags(tags ? tags : []);
        setEditTags(false);
    };

    const updateDocumentation = async () => {
        store.setRichTextContentInLibrary(richTextContent);
        const payload = {
            id: id,
            filename: name,
            finalData: [],
            tags: undefined,
            document: richTextContent,
            userId: owner,
            status: status,
            reviewer: reviewer,
        };
        await store.update(payload);
        setEditDocumentation(false);
    };

    const richTextContentUpdate = html => {
        if (html) {
            setRichTextContent(html);
        }
    };

    const richTextEditorCancel = () => {
        setEditDocumentation(false);
        setRichTextContent(() =>
            store.richTextContentInLibrary !== undefined ? store.richTextContentInLibrary : ""
        );
    };

    const ApproveAction = () => {
        const title = `${ownerName} has requested your review on this phenotype. Please carefully review it and approve it when you are happy with the phenotype. If you have questions on the codes or would like changes made, you can reject this review and reach out the author to provide feedback.`;
        return (
            <Grid container>
                <Grid>
                    <Typography sx={{ marginBottom: "20px" }}>{title}</Typography>
                    <>
                        <BasicButton
                            type="submit"
                            handleClick={async () => {
                                const { isConfirmed } = await Confirm(
                                    "Confirm Rejection",
                                    "Are you sure you do not want to approve this code?"
                                );
                                if (isConfirmed) {
                                    await store.updateStatus(id, PHENOTYPE_STATE.REJECTED);
                                }
                            }}
                            endIcon={<CancelOutlined size="1rem" />}
                            buttonText="Reject"
                            variant="outlined"
                            color="error"
                        />
                        <BasicButton
                            type="submit"
                            handleClick={async () => {
                                const { isConfirmed } = await Confirm(
                                    "Confirm Approval",
                                    "Are you sure you want to approve this review?"
                                );
                                if (isConfirmed) {
                                    await store.updateStatus(id, PHENOTYPE_STATE.APPROVED);
                                }
                            }}
                            endIcon={<CheckCircleOutline size="1rem" />}
                            buttonText="Approve"
                            variant="contained"
                            color="success"
                            sx={{ margin: "0 10px 0 10px" }}
                        />
                    </>
                </Grid>
            </Grid>
        );
    };

    const ReleaseAction = () => {
        const title =
            "The code has been approved by the reviewer. You can choose to share this code more widely (with all users on Dexter) by releasing it publicly!";
        return (
            <Grid container>
                <Grid
                    size={{
                        xs: 11,
                        md: 11,
                        lg: 11,
                        xl: 11,
                    }}
                >
                    <Typography variant="body2" sx={{ marginBottom: "10px" }}>
                        {title}
                    </Typography>
                </Grid>
                <Grid
                    size={{
                        xs: 1,
                        md: 1,
                        lg: 1,
                        xl: 1,
                    }}
                >
                    <Tooltip
                        title="Share this code more widely (with all users on Dexter)"
                        aria-label="share this code more widely (with all users on Dexter)"
                    >
                        <span style={{ textAlign: "right" }}>
                            <BasicButton
                                handleClick={async () => {
                                    const { isConfirmed } = await Confirm(
                                        "Confirm Action",
                                        "Please confirm that you would like to share this code more widely?"
                                    );
                                    if (isConfirmed) {
                                        await store.updateStatus(
                                            id,
                                            PHENOTYPE_STATE.PUBLIC_RELEASE
                                        );
                                    }
                                }}
                                buttonText="Release"
                            />
                        </span>
                    </Tooltip>
                </Grid>
            </Grid>
        );
    };

    const RejectActionMessage = () => {
        return (
            <Grid container>
                <Grid
                    size={{
                        xs: 12,
                        md: 12,
                        lg: 12,
                        xl: 12,
                    }}
                >
                    <Typography variant="body2" sx={{ marginBottom: "10px" }}>
                        This phenotype did not pass the review. Please collect feedback from the
                        reviewer. You can edit this file and make the suggested changes, editing it
                        will set its status back to `DRAFT` and you can request for a review again.
                    </Typography>
                </Grid>
            </Grid>
        );
    };

    const GetTooltipContent = () => {
        if (!canShare && status !== PHENOTYPE_STATE.DRAFT) {
            return "Please edit the code in order to re-share";
        }

        return "Request a review for this list";
    };

    return (
        <Grid container justifyContent="center">
            <Grid
                size={{
                    xs: 12,
                    md: 11,
                    lg: 11,
                    xl: 10,
                }}
            >
                <Grid container spacing={1} justifyContent="center">
                    <Grid size={6}>
                        <BasicButton
                            variant="text"
                            sx={{ m: 2 }}
                            handleClick={handleBack}
                            buttonText="Back to Library"
                            startIcon={<ArrowBack />}
                        />
                    </Grid>
                    <Grid textAlign="end" size={6}>
                        <Tooltip
                            title={favoritedByUser ? "Remove from favorites" : "Add to favorites"}
                        >
                            <IconButton
                                aria-label={
                                    favoritedByUser ? "remove from favorites" : "add to favorites"
                                }
                                disabled={store.loading === true}
                                onClick={async () => {
                                    store.favoriteCode(id);
                                }}
                            >
                                <Badge badgeContent={favoriteCount}>
                                    {favoritedByUser ? (
                                        <GradeIcon sx={{ color: "darkorange" }} />
                                    ) : (
                                        <GradeOutlinedIcon color="secondary" />
                                    )}
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <DisplayDialogue
                            store={store}
                            selectedUserTags={selectedUserTags}
                            richTextContent={richTextContent}
                            title={GetTooltipContent()}
                            canShare={canShare}
                            codeForAction={store.codeToView}
                        />
                        {canAction && (
                            <Tooltip title="Delete">
                                <IconButton
                                    aria-label={"Delete"}
                                    color="secondary"
                                    onClick={onDelete}
                                >
                                    <DeleteIcon fontSize="medium" />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="Edit code list">
                            <span>
                                <BasicButton
                                    buttonText="Edit"
                                    variant="outlined"
                                    handleClick={onEdit}
                                    size="medium"
                                    endIcon={<EditIcon />}
                                    sx={{
                                        m: 2,
                                    }}
                                />
                            </span>
                        </Tooltip>
                    </Grid>
                </Grid>

                <div className={box}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={1} justifyContent="center">
                            <Grid size={12}>
                                <Tooltip title={name}>
                                    <Typography
                                        noWrap
                                        variant="h4"
                                        component="h4"
                                        className={ellipses}
                                    >
                                        {name}
                                    </Typography>
                                </Tooltip>
                            </Grid>

                            <Grid size={12}>
                                <div className={margin}>
                                    <span className={bolderFont}>Created By: </span>
                                    {ownerName}
                                </div>

                                <div className={margin}>
                                    <span className={bolderFont}>Created On: </span>
                                    {formatDate(createdOn, DATE_TIME_FORMAT)}
                                </div>
                                {modifiedOn !== createdOn && modifiedBy && (
                                    <div className={margin}>
                                        <span className={bolderFont}>Modified By: </span>
                                        {modifiedBy}
                                    </div>
                                )}

                                {modifiedOn !== createdOn && modifiedOn && (
                                    <div className={margin}>
                                        <span className={bolderFont}>Modified On: </span>
                                        {formatDate(modifiedOn, DATE_TIME_FORMAT)}
                                    </div>
                                )}
                                {status !== PHENOTYPE_STATE.DRAFT && reviewer && (
                                    <div className={margin}>
                                        <span className={bolderFont}>Reviewer: </span>
                                        {reviewer}
                                    </div>
                                )}

                                {status !== PHENOTYPE_STATE.DRAFT &&
                                    status !== PHENOTYPE_STATE.UNDER_REVIEW &&
                                    approvedBy && (
                                        <div className={margin}>
                                            <span className={bolderFont}>
                                                {status === PHENOTYPE_STATE.REJECTED
                                                    ? "Rejected By: "
                                                    : "Approved By: "}
                                            </span>
                                            {approvedBy}
                                        </div>
                                    )}
                                {status !== PHENOTYPE_STATE.DRAFT &&
                                    status !== PHENOTYPE_STATE.UNDER_REVIEW &&
                                    approvedOn && (
                                        <div className={margin}>
                                            <span className={bolderFont}>
                                                {status === PHENOTYPE_STATE.REJECTED
                                                    ? "Rejected On: "
                                                    : "Approved On: "}
                                            </span>
                                            {formatDate(approvedOn, DATE_TIME_FORMAT)}
                                        </div>
                                    )}
                                {dbNames && (
                                    <div className={margin}>
                                        <span className={bolderFont}>Contains codes for: </span>
                                        {dbNames.map(db => {
                                            return (
                                                <Chip
                                                    key={db}
                                                    style={{ margin: "5px" }}
                                                    size="small"
                                                    label={db}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                                <div className={margin}>
                                    <>
                                        {hasStatus && (
                                            <>
                                                <Chip
                                                    label={status}
                                                    sx={{
                                                        margin: "5px",
                                                    }}
                                                    component="span"
                                                    color="primary"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                                <GetIconForThisCodeStatus status={status} />
                                            </>
                                        )}
                                    </>
                                </div>
                            </Grid>
                        </Grid>
                    </Box>
                </div>
            </Grid>
            {(canApprove || canRelease || status === PHENOTYPE_STATE.REJECTED) && (
                <Grid
                    size={{
                        xs: 12,
                        md: 11,
                        lg: 11,
                        xl: 10,
                    }}
                >
                    <div style={{ margin: "20px" }}>
                        <Card>
                            <CardHeader title="Action" />

                            <Divider variant="middle" sx={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
                            <CardContent>
                                {canApprove && <ApproveAction />}
                                {canRelease && <ReleaseAction />}
                                {status === PHENOTYPE_STATE.REJECTED && <RejectActionMessage />}
                            </CardContent>
                        </Card>
                    </div>
                </Grid>
            )}
            <Grid
                size={{
                    xs: 12,
                    md: 11,
                    lg: 11,
                    xl: 10,
                }}
            >
                <div style={{ margin: "20px" }}>
                    <Card>
                        <CardHeader
                            title="Tags"
                            action={
                                canAction && (
                                    <>
                                        {editTags ? (
                                            <Stack spacing={1} direction="row">
                                                <BasicButton
                                                    buttonText="cancel"
                                                    variant="outlined"
                                                    handleClick={() => {
                                                        cancelEditTags();
                                                    }}
                                                />
                                                <Tooltip title="Update tags">
                                                    <BasicButton
                                                        buttonText="update"
                                                        handleClick={async () => {
                                                            updateTags();
                                                        }}
                                                        endIcon={<SaveIcon />}
                                                    />
                                                </Tooltip>
                                            </Stack>
                                        ) : (
                                            <Tooltip title="Modify tags">
                                                <IconButton
                                                    onClick={() => {
                                                        setEditTags(true);
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </>
                                )
                            }
                        />

                        <Divider variant="middle" sx={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
                        <CardContent>
                            {editTags ? (
                                <AutocompleteUserTags
                                    userTagAutoCompleteOptions={userTagAutoCompleteOptions}
                                    selectedUserTags={selectedUserTags}
                                    handleCreateNewUserTag={handleCreateNewUserTag}
                                    handleUserTagChange={handleUserTagChange}
                                    handleChange={handleChange}
                                    readOnly={!editTags}
                                />
                            ) : (
                                <div>
                                    {selectedUserTags.map(tags => {
                                        return (
                                            <Chip
                                                key={tags}
                                                style={{ margin: "5px" }}
                                                size="small"
                                                label={tags}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 11,
                    lg: 11,
                    xl: 10,
                }}
            >
                <div style={{ margin: "20px" }}>
                    <MUIDataTable
                        title="Codes"
                        columns={columns}
                        data={store.masterCodeListForView.slice()}
                        options={optionsForLoadedCodesTable}
                    />
                </div>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 11,
                    lg: 11,
                    xl: 10,
                }}
            >
                <div style={{ margin: "20px" }}>
                    <Card>
                        <CardHeader
                            title="Documentation"
                            action={
                                canAction && (
                                    <>
                                        {editDocumentation ? (
                                            <Stack spacing={1} direction="row">
                                                <BasicButton
                                                    buttonText="cancel"
                                                    variant="outlined"
                                                    handleClick={() => {
                                                        richTextEditorCancel();
                                                    }}
                                                />
                                                <Tooltip title="Update documentation">
                                                    <BasicButton
                                                        buttonText="update"
                                                        handleClick={async () => {
                                                            updateDocumentation();
                                                        }}
                                                        endIcon={<SaveIcon />}
                                                    ></BasicButton>
                                                </Tooltip>
                                            </Stack>
                                        ) : (
                                            <Tooltip title="Modify documentation">
                                                <IconButton
                                                    onClick={() => {
                                                        setEditDocumentation(true);
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </>
                                )
                            }
                        />
                        <Divider variant="middle" sx={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
                        <CardContent>
                            <RichTextDocumentationEditor
                                readOnly={editDocumentation ? "" : true}
                                richTextContent={store.richTextContentInLibrary}
                                updateContent={editDocumentation ? richTextContentUpdate : () => {}}
                                template={
                                    drugs
                                        ? DRUG_CODELIST_DOCUMENTATION_TEMPLATE
                                        : MEDICAL_CODELIST_DOCUMENTATION_TEMPLATE
                                }
                            />
                        </CardContent>
                    </Card>
                </div>
            </Grid>
        </Grid>
    );
});

export default ViewCodes;
