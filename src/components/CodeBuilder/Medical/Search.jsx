import React, { useState } from "react";
import { observer } from "mobx-react";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { Dropdown, Input } from "../../Common";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import WarningIcon from "@mui/icons-material/Warning";
import medicalStore from "../../../state/store/codebuilder/medical";
import codeBuilderCommonStore from "../../../state/store/codebuilder/common";
import SearchMode from "../Common/SearchMode";
import AdvancedSearch from "../Common/AdvancedSearch";

import session from "../../../state/store/session";
import { localStore } from "../../../lib/storage";
import events from "../../../lib/events";

import {
    CB_LOCAL_STORAGE_KEYS as KEYS,
    CODE_BUILDER_OR_DELIMITER,
    CODE_BUILDER_SEARCH_MODE as SEARCH_MODE,
    CODE_BUILDER_TYPE,
    DATA_ID,
    DESC,
    MEDICAL_CODE1,
    MEDICAL_CODE2,
    WILDCARD_TOOLTIP,
} from "../../../constants";

import {
    addPercentIfRequired,
    CODE_BUILDER_SIMPLE_SEARCH_OPTIONS_FOR_MEDICAL,
} from "../../../utils";
import { Checkbox, FormGroup, Grid2 as Grid, InputAdornment } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Upload from "../Upload";
import FormControlLabel from "@mui/material/FormControlLabel";
import { DataNotFound } from "../Common/DataNotFound";
import { ShowWarning } from "../../../componentsV2/Common/Toast";
import { Confirm } from "../../../componentsV2/Common/Confirm";

export const Search = observer(
    ({
        initialState,
        state,
        prevQuery,
        setPreviousQuery,
        dispatch,
        updateStoreValue,
        resetFilters,
    }) => {
        const user = session.loggedInUser;
        const [toDisplay, setToDisplay] = React.useState();
        const getStoreValue = key => {
            return localStore.get(key + CODE_BUILDER_TYPE.MEDICAL);
        };
        const [uploadedDataNotFound, setUploadedDataNotFound] = React.useState([]);
        const [uploadedData, setUploadedData] = React.useState(null);
        const [selectedDB, setSelectedDB] = useState("");
        const [dataContainsHeader, setDataContainsHeader] = React.useState(false);

        // Get from local storage or default to simple storage
        const [searchType, setSearchType] = React.useState(
            () => getStoreValue(user + KEYS.TYPE) || SEARCH_MODE.SIMPLE
        );

        const [advQueryValue, setAdvQueryValue] = React.useState(() => {
            return getStoreValue(user + KEYS.ADVANCED_SEARCH_FILTER) || {};
        });

        // Switch between Simple / Advanced Searches
        const updateSearchType = type => {
            updateStoreValue(KEYS.TYPE, type);
            setSearchType(type);
        };

        const updateAdvQueryValue = value => {
            setAdvQueryValue(value);
            updateStoreValue(KEYS.ADVANCED_SEARCH_FILTER, value);
        };

        const propsForAdvSearch = {
            queryValue: advQueryValue,
            setQueryValue: updateAdvQueryValue,
            drugOrMedical: CODE_BUILDER_TYPE.MEDICAL,
            setToDisplay,
        };

        function getQuery() {
            const params = [];
            const { description } = state;
            const medicalId = state.medicalId === "" ? DESC : state.medicalId;
            if (medicalId.toLowerCase() === "all") {
                params.push(DESC + addPercentIfRequired(description.toLowerCase()));

                params.push(DATA_ID + addPercentIfRequired(description));

                params.push(MEDICAL_CODE1 + addPercentIfRequired(description.toLowerCase()));

                params.push(MEDICAL_CODE2 + addPercentIfRequired(description));
            } else {
                params.push(medicalId + addPercentIfRequired(description.toLowerCase()));
            }
            return params.length > 0 ? params.join(CODE_BUILDER_OR_DELIMITER) : "";
        }

        const submit = async event => {
            event.preventDefault();

            const query = searchType === SEARCH_MODE.SIMPLE ? getQuery() : advQueryValue?.apiSQL;

            if (!query) {
                ShowWarning("Please provide a search filter");
                return;
            }

            if (query === prevQuery) {
                ShowWarning("Please change any search filter to continue");
                return;
            }

            setPreviousQuery(query);
            await medicalStore.search(query);
        };

        const clearResults = async () => {
            const { isConfirmed } = await Confirm(
                "Clear All",
                "Confirm you want to clear the workspace?"
            );

            if (isConfirmed) {
                setSelectedDB("");
                resetFilters();
                setUploadedData(null);
                setDataContainsHeader(false);
                setUploadedDataNotFound([]);
                updateAdvQueryValue({});
                events.emit("clear.medical.filename");
            }
        };

        // Store Medical related filter local storage
        const storeFilter = (key, value) => {
            const currentValue = getStoreValue(user + KEYS.SIMPLE_SEARCH_FILTER) ?? initialState;

            currentValue[key] = value;
            updateStoreValue(KEYS.SIMPLE_SEARCH_FILTER, currentValue);
            dispatch({ type: key, payload: value });
        };

        if (codeBuilderCommonStore.loading) {
            return "loading..";
        }

        const disableSearch =
            codeBuilderCommonStore.userDatabasesFetched &&
            codeBuilderCommonStore.userDatabases.length === 0;

        const importUploadedCodesToDexter = async () => {
            dataContainsHeader && uploadedData.splice(0, 1);
            const firstColumn = uploadedData.map(x => x[0]);
            handleDropdownValueChange("");
            const dataNotFound = await medicalStore.upload(firstColumn, selectedDB);
            setUploadedDataNotFound(dataNotFound);

            setUploadedData(null);
        };

        const handleFileUpload = async res => {
            const processed = res?.data;
            setDataContainsHeader(false);
            if (processed && Array.isArray(processed) && processed.length > 0) {
                setUploadedData(processed);
            }
            setUploadedDataNotFound([]);
        };

        const handleDropdownValueChange = value => {
            setSelectedDB(value);
            // In order to clear all previous errors (if any) upon selecting a new database to ensure user sees the initial UI and is not confused by errors from a previously loaded CSV file before selecting a new one.
            setUploadedDataNotFound([]);
        };

        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    "& > :not(style)": {
                        m: 1,
                        width: { xs: "100%", sm: "90%", md: "90%", lg: "85%" },
                        padding: "10px",
                    },
                }}
            >
                <Paper elevation={2}>
                    <SearchMode
                        searchType={searchType}
                        updateSearchType={updateSearchType}
                        disabled={medicalStore.loading}
                        clearResults={clearResults}
                        toDisplay={toDisplay}
                        advanced={searchType === SEARCH_MODE.ADVANCED}
                    />
                    {searchType === SEARCH_MODE.UPLOAD ? (
                        <>
                            <Upload
                                page="medical"
                                uploadedData={uploadedData}
                                handleFileUpload={handleFileUpload}
                                handleClear={() => {
                                    setUploadedData(null);
                                }}
                                selectedDB={selectedDB}
                                setSelectedDB={handleDropdownValueChange}
                            />
                            {uploadedData && (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={dataContainsHeader}
                                                    onChange={() => {
                                                        setDataContainsHeader(!dataContainsHeader);
                                                    }}
                                                />
                                            }
                                            label="My data contains header"
                                        />
                                    </FormGroup>
                                    <Button
                                        size="small"
                                        type="submit"
                                        onClick={async () => {
                                            await importUploadedCodesToDexter();
                                        }}
                                        variant="contained"
                                        color="primary"
                                        disabled={medicalStore.loading || disableSearch}
                                    >
                                        {medicalStore.loading
                                            ? "Loading..."
                                            : "import uploaded codes"}
                                    </Button>
                                    {disableSearch && (
                                        <Tooltip
                                            title="No databases assigned, cannot upload."
                                            sx={{ marginLeft: "5px" }}
                                        >
                                            <WarningIcon color="warning" />
                                        </Tooltip>
                                    )}
                                </div>
                            )}
                            {uploadedDataNotFound.length > 0 && (
                                <DataNotFound dataNotFound={uploadedDataNotFound} />
                            )}
                        </>
                    ) : (
                        <form onSubmit={submit}>
                            {searchType === SEARCH_MODE.ADVANCED ? (
                                <>
                                    <AdvancedSearch {...propsForAdvSearch} />
                                </>
                            ) : (
                                <Grid container spacing={1}>
                                    <Grid
                                        size={{
                                            xs: 2,
                                            md: 2,
                                            lg: 2,
                                        }}
                                    >
                                        <Dropdown
                                            value={state.medicalId === "" ? DESC : state.medicalId}
                                            onChange={e => storeFilter("medicalId", e.target.value)}
                                            style={{ marginTop: 16 }}
                                            dropdownOptions={
                                                CODE_BUILDER_SIMPLE_SEARCH_OPTIONS_FOR_MEDICAL
                                            }
                                        ></Dropdown>
                                    </Grid>
                                    <Grid
                                        size={{
                                            xs: 10,
                                            md: 10,
                                            lg: 10,
                                        }}
                                    >
                                        <Input
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Tooltip title={WILDCARD_TOOLTIP}>
                                                            <IconButton
                                                                aria-label="tooltip"
                                                                edge="end"
                                                            >
                                                                <InfoIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            id="medical-search"
                                            name="Description"
                                            value={state.description}
                                            size="small"
                                            onChange={e =>
                                                storeFilter("description", e.target.value)
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            )}
                            <div
                                id="buttons"
                                style={{
                                    display: "flex",
                                    margin: "10px",
                                    justifyContent: "center",
                                }}
                            >
                                <Button
                                    size="small"
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={medicalStore.loading || disableSearch}
                                >
                                    {medicalStore.loading ? "Loading..." : "Search"}
                                </Button>
                                {disableSearch && (
                                    <Tooltip
                                        title="No databases assigned, Search is disabled."
                                        sx={{ marginLeft: "5px" }}
                                    >
                                        <WarningIcon color="warning" />
                                    </Tooltip>
                                )}
                            </div>
                        </form>
                    )}
                </Paper>
            </Box>
        );
    }
);
