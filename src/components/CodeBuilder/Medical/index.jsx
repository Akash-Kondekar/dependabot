import React from "react";
import { observer } from "mobx-react";

import { Chip, Grid2 as Grid, Typography } from "@mui/material";
import MUIDataTable from "mui-datatables";
import medicalStore from "../../../state/store/codebuilder/medical";

import codeBuilderCommonStore from "../../../state/store/codebuilder/common";
import session from "../../../state/store/session";

import { localStore } from "../../../lib/storage";
import { Search } from "./Search";

import {
    columnsForMedicalCodes,
    optionsMasterCodeList,
    optionsShortlistedCodes,
} from "./table-data";

import {
    CB_LOCAL_STORAGE_KEYS as KEYS,
    CODE_BUILDER_TYPE,
    DESC,
    MEDICAL_CODELIST_DOCUMENTATION_TEMPLATE,
} from "../../../constants";
import IconButton from "@mui/material/IconButton";
import { ShoppingBasket } from "@mui/icons-material";
import Badge from "@mui/material/Badge";
import ShortListedCodesDialog from "../Common/ShortListedCodesDialog";

const initialState = {
    medicalId: DESC,
    description: "",
    snomedCTCode: "",
    medicalCode: "",
};

function getInitialState() {
    const user = session.loggedInUser;

    // For the loggedIn user, get the previously saved filters.
    const previousFilters = localStore.get(
        user + KEYS.SIMPLE_SEARCH_FILTER + CODE_BUILDER_TYPE.MEDICAL
    );

    return {
        ...initialState, // Apply defaults
        ...previousFilters, // Override from local storage
    };
}

function stateReducer(state, action) {
    switch (action.type) {
        case "medicalId":
            return { ...state, medicalId: action.payload };
        case "description":
            return { ...state, description: action.payload };
        case "snomedCTCode":
            return { ...state, snomedCTCode: action.payload };
        case "medicalCode":
            return { ...state, medicalCode: action.payload };
        case "reset":
            return initialState;
        default:
            throw new Error("Unexpected action type");
    }
}

const Medical = observer(() => {
    const [prevQuery, setPreviousQuery] = React.useState("");
    const [state, dispatch] = React.useReducer(stateReducer, getInitialState()); // State to manage all filters
    const user = session.loggedInUser;

    React.useEffect(() => {
        // Fill in the results/shortlisted codes if any.
        medicalStore.setPreviousResults();
    }, []);

    React.useEffect(() => {
        const codeToEdit = medicalStore.codeToEdit;

        const getCodesToEdit = async () => {
            if (codeToEdit) {
                resetFilters();
                await medicalStore.load(codeToEdit);
            }
        };
        getCodesToEdit();
    }, [medicalStore.codeToEdit]);

    React.useEffect(() => {
        (async () => {
            codeBuilderCommonStore.userDatabasesFetched === false &&
                (await codeBuilderCommonStore.getDatabasesFor(session.loggedInUser));
        })();
    }, []);

    const updateStoreValue = (key, value) => {
        localStore.set(user + key + CODE_BUILDER_TYPE.MEDICAL, value);
    };

    const resetFilters = () => {
        dispatch({ type: "reset" });
        setPreviousQuery("");
        medicalStore.resetResults();
        updateStoreValue(KEYS.SIMPLE_SEARCH_FILTER, initialState);
        updateStoreValue(KEYS.SHORTLISTED_CODES, []);
        updateStoreValue(KEYS.SHORTLISTED_INDEXES, []);
        updateStoreValue(KEYS.CODES_TO_FILTER, []);
        updateStoreValue(KEYS.ADVANCED_SEARCH_FILTER, {});
    };

    return (
        <Grid container justifyContent={"center"}>
            <Grid
                size={{
                    xs: 12,
                    md: 11,
                    lg: 11,
                    xl: 10,
                }}
            >
                <Typography variant="h5" gutterBottom align="center" padding="10px">
                    Create Medical Codes
                </Typography>
                <div>
                    <Search
                        initialState={initialState}
                        state={state}
                        prevQuery={prevQuery}
                        setPreviousQuery={setPreviousQuery}
                        dispatch={dispatch}
                        updateStoreValue={updateStoreValue}
                        resetFilters={resetFilters}
                    />
                </div>
                <div>
                    <Results />
                </div>
            </Grid>
        </Grid>
    );
});

const Results = observer(() => {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    return (
        <>
            {medicalStore.shortlistedCodes?.length > 0 ? (
                <div
                    style={{
                        margin: "10px",
                    }}
                >
                    <Chip
                        variant="outlined"
                        color="primary"
                        size="medium"
                        label="Shortlisted codes"
                        onClick={handleClickOpen}
                        icon={
                            <IconButton aria-label="cart">
                                <Badge
                                    badgeContent={medicalStore.shortlistedCodes?.length}
                                    max={9999}
                                    color="secondary"
                                >
                                    <ShoppingBasket fontSize={"inherit"} />
                                </Badge>
                            </IconButton>
                        }
                    />
                </div>
            ) : null}

            <MUIDataTable
                title="Codes to filter"
                columns={columnsForMedicalCodes}
                data={medicalStore.masterCodeList.slice()}
                options={optionsMasterCodeList}
            />

            {open && (
                <ShortListedCodesDialog
                    open={open}
                    handleClose={handleClose}
                    store={medicalStore}
                    columnsForTheTable={columnsForMedicalCodes}
                    tableOptions={optionsShortlistedCodes}
                    clearOn="clear.medical.filename"
                    documentationTemplate={MEDICAL_CODELIST_DOCUMENTATION_TEMPLATE}
                />
            )}
            <div
                style={{
                    marginTop: "20px",
                }}
            ></div>
        </>
    );
});

export default Medical;
