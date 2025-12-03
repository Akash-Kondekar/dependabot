import React, { useEffect, useState } from "react";
import events from "../../../lib/events";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, Grid2 as Grid, InputAdornment } from "@mui/material";
import DialogActions from "@mui/material/DialogActions";
import SaveIcon from "@mui/icons-material/Save";
import DialogContent from "@mui/material/DialogContent";
import { Input, ShowError } from "../../Common";
import Tooltip from "@mui/material/Tooltip";
import { CODE_LIST_NAMING_CONVENTION, PHENOTYPE_STATE } from "../../../constants";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import RichTextDocumentationEditor from "./RichTextDocumentationEditor";
import MUIDataTable from "mui-datatables";
import { AutocompleteUserTags } from "./AutoCompleteUserTags";
import CircularProgress from "@mui/material/CircularProgress";

const ShortListedCodesDialog = ({
    open,
    handleClose,
    store,
    columnsForTheTable,
    tableOptions,
    clearOn,
    documentationTemplate,
}) => {
    const CODELIST_NAME_MAXLENGTH = 60;
    const [savingFileAnimation, setSavingFileAnimation] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [fileName, setFileName] = useState(() => (store.fileName ? store.fileName : ""));
    const [inputError, setInputError] = React.useState(false);
    const [userTagAutoCompleteOptions, setUserTagAutoCompleteOptions] = useState([]);
    const [selectedUserTags, setSelectedUserTags] = useState(() =>
        store.selectedUserTags ? store.selectedUserTags : []
    );
    const [richTextContent, setRichTextContent] = useState(() =>
        store.richTextContent !== undefined ? store.richTextContent : ""
    );

    useEffect(() => {
        const debounceTimer = setTimeout(async () => {
            const autoCompleteOptions = await store.searchUserTagLookup(searchTerm);
            autoCompleteOptions && setUserTagAutoCompleteOptions(autoCompleteOptions);
        }, 700);
        return () => {
            clearTimeout(debounceTimer);
        };
    }, [searchTerm]);

    const handleChange = e => {
        setSearchTerm(e.target.value);
    };

    function handleUserTagChange(value) {
        if (Array.isArray(value)) {
            setSelectedUserTags(value);
            store.setSelectedUserTags(value);
        } else {
            setSelectedUserTags([...selectedUserTags, value]);
            store.setSelectedUserTags([...selectedUserTags, value]);
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

    const clearStoreAndLocalState = () => {
        store.resetFilename();
        setFileName("");
        setSelectedUserTags([]);
        setRichTextContent("");
    };

    React.useEffect(() => {
        events.on(clearOn, clearStoreAndLocalState);
        return () => {
            events.off(clearOn, store.resetFilename);
        };
    }, []);

    async function handleSave() {
        setSavingFileAnimation(true);
        const rowIdsToSave = store.shortlistedCodes.map(row => row.rowid);

        if (rowIdsToSave.length === 0 || fileName.trim() === "") {
            // No Rows to save or File name is blank
            return;
        }

        const payload = {
            filename: fileName,
            finalData: rowIdsToSave,
            tags: selectedUserTags,
            document: richTextContent,
            reviewer: store.status === PHENOTYPE_STATE.UNDER_REVIEW ? store.reviewer : "",
            status:
                store.status === PHENOTYPE_STATE.UNDER_REVIEW
                    ? PHENOTYPE_STATE.UNDER_REVIEW
                    : PHENOTYPE_STATE.DRAFT,
        };

        await store.save(payload);
        setSavingFileAnimation(false);
    }

    const richTextContentUpdate = html => {
        if (html) {
            setRichTextContent(html);
            store.setRichTextContent(html);
        }
    };

    function handleNameChange(e) {
        setFileName(e.target.value);
        store.setFileName(e.target.value);
    }

    return (
        <Dialog fullWidth={true} maxWidth={"xl"} open={open} onClose={handleClose}>
            <form
                onSubmit={e => {
                    setInputError(false);
                    e.preventDefault();
                    handleSave();
                }}
            >
                <DialogTitle>
                    <Grid container spacing={1} justifyContent="space-between">
                        <Grid
                            size={{
                                xs: 9,
                                md: 9,
                                lg: 9,
                            }}
                        >
                            Shortlisted codes
                        </Grid>
                        <Grid
                            size={{
                                xs: 3,
                                md: 3,
                                lg: 3,
                            }}
                        >
                            <DialogActions>
                                <Button
                                    type="submit"
                                    disabled={
                                        fileName === "" ||
                                        store.shortlistedCodes?.length === 0 ||
                                        inputError ||
                                        savingFileAnimation
                                    }
                                    variant="outlined"
                                    endIcon={
                                        savingFileAnimation ? (
                                            <CircularProgress size="1rem" />
                                        ) : (
                                            <SaveIcon />
                                        )
                                    }
                                >
                                    {savingFileAnimation ? "Saving" : "Save"}
                                </Button>
                                <Button onClick={handleClose}>Close</Button>
                            </DialogActions>
                        </Grid>
                    </Grid>
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid
                            size={{
                                xs: 12,
                                md: 12,
                                lg: 12,
                            }}
                        >
                            <b>Provide a name for the code list</b>
                            <Input
                                error={inputError}
                                value={fileName}
                                size="small"
                                id="medical-code-list-name"
                                name="Code filename"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip title={CODE_LIST_NAMING_CONVENTION}>
                                                <IconButton aria-label="tooltip" edge="end">
                                                    <InfoIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                                onChange={e => {
                                    handleNameChange(e);
                                    if (e.target.validity.valid) {
                                        setInputError(false);
                                    } else {
                                        setInputError(true);
                                    }
                                }}
                                inputProps={{
                                    pattern: "[A-Za-z0-9_]+",
                                    maxlength: CODELIST_NAME_MAXLENGTH,
                                }}
                                helperText={
                                    inputError &&
                                    `Alphanumeric and Underscore Allowed (No Spaces), max length of ${CODELIST_NAME_MAXLENGTH} characters.`
                                }
                                label="Enter a name for the code list"
                                required={true}
                            />
                            {fileName.length > CODELIST_NAME_MAXLENGTH - 10 && (
                                <div
                                    style={{
                                        fontSize: "smaller",
                                        textAlign: "right",
                                        width: "100%",
                                        paddingBottom: "10px",
                                    }}
                                >
                                    {fileName.length}/{CODELIST_NAME_MAXLENGTH}
                                </div>
                            )}
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                md: 12,
                                lg: 12,
                            }}
                        >
                            <b>Add tags to personalise code list</b>
                            <AutocompleteUserTags
                                userTagAutoCompleteOptions={userTagAutoCompleteOptions}
                                selectedUserTags={selectedUserTags}
                                handleCreateNewUserTag={handleCreateNewUserTag}
                                handleUserTagChange={handleUserTagChange}
                                handleChange={handleChange}
                            />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                md: 12,
                                lg: 12,
                            }}
                        >
                            <b>Add documentation</b>
                            <div style={{ marginBottom: "10px" }}></div>
                            <RichTextDocumentationEditor
                                richTextContent={richTextContent}
                                updateContent={richTextContentUpdate}
                                template={documentationTemplate}
                            />
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                md: 12,
                                lg: 12,
                            }}
                        >
                            <>
                                <MUIDataTable
                                    title="Shortlisted Codes"
                                    columns={columnsForTheTable}
                                    data={store.shortlistedCodes.slice()}
                                    options={tableOptions}
                                />
                            </>
                        </Grid>
                    </Grid>
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default ShortListedCodesDialog;
