import React from "react";
import { observer } from "mobx-react";

import { Chip, Grid2 as Grid, Typography } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { Search } from "./Search";

import drugStore from "../../../state/store/codebuilder/drugs";
import drugsStore from "../../../state/store/codebuilder/drugs";
import codeBuilderCommonStore from "../../../state/store/codebuilder/common";
import session from "../../../state/store/session";
import { localStore } from "../../../lib/storage";

import { columnsForDrugCodes, optionsDrugCodeList, optionsShortlistedCodes } from "./table-data";

import {
    CB_LOCAL_STORAGE_KEYS as KEYS,
    CODE_BUILDER_TYPE,
    DRUG_CODELIST_DOCUMENTATION_TEMPLATE,
} from "../../../constants";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import { ShoppingBasket } from "@mui/icons-material";
import ShortListedCodesDialog from "../Common/ShortListedCodesDialog";

const initialState = {
    drugId: "",
    description: "",
    bnf: "",
    atcCode: "",
};

function getInitialState() {
    const user = session.loggedInUser;

    // For the loggedIn user, get the previously saved filters.
    const previousFilters = localStore.get(
        user + KEYS.SIMPLE_SEARCH_FILTER + CODE_BUILDER_TYPE.DRUG
    );

    return {
        ...initialState, // Apply defaults
        ...previousFilters, // Override from local storage
    };
}

function stateReducer(state, action) {
    switch (action.type) {
        case "drugId":
            return { ...state, drugId: action.payload };
        case "description":
            return { ...state, description: action.payload };
        case "bnf":
            return { ...state, bnf: action.payload };
        case "atcCode":
            return { ...state, atcCode: action.payload };
        case "reset":
            return initialState;
        default:
            throw new Error("Unexpected action type");
    }
}

const Drugs = observer(() => {
    const [prevQuery, setPreviousQuery] = React.useState("");

    const [state, dispatch] = React.useReducer(stateReducer, getInitialState()); // State to manage all filters
    const user = session.loggedInUser;

    React.useEffect(() => {
        // Fill in the results/shortlisted codes if any.
        drugStore.setPreviousResults();
    }, []);

    React.useEffect(() => {
        const codeToEdit = drugStore.codeToEdit;

        const getCodesToEdit = async () => {
            if (codeToEdit) {
                resetFilters();
                await drugStore.load(codeToEdit);
            }
        };
        getCodesToEdit();
    }, [drugStore.codeToEdit]);

    React.useEffect(() => {
        (async () => {
            codeBuilderCommonStore.userDatabasesFetched === false &&
                (await codeBuilderCommonStore.getDatabasesFor(session.loggedInUser));
        })();
    }, []);

    const updateStoreValue = (key, value) => {
        localStore.set(user + key + CODE_BUILDER_TYPE.DRUG, value);
    };

    const resetFilters = () => {
        drugsStore.resetResults();
        dispatch({ type: "reset" });
        setPreviousQuery("");
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
                    Create Drug Codes
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
            {drugStore.shortlistedCodes?.length > 0 ? (
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
                                    badgeContent={drugStore.shortlistedCodes?.length}
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
                columns={columnsForDrugCodes}
                data={drugStore.masterCodeList.slice()}
                options={optionsDrugCodeList}
            />

            {open && (
                <ShortListedCodesDialog
                    open={open}
                    handleClose={handleClose}
                    store={drugStore}
                    columnsForTheTable={columnsForDrugCodes}
                    tableOptions={optionsShortlistedCodes}
                    clearOn="clear.drug.filename"
                    documentationTemplate={DRUG_CODELIST_DOCUMENTATION_TEMPLATE}
                />
            )}

            <div
                style={{
                    marginTop: "20px",
                }}
            />
        </>
    );
});

export default Drugs;
