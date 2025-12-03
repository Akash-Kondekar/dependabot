import React from "react";
import { observer } from "mobx-react";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { Input } from "../../../Common";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import HistoryIcon from "@mui/icons-material/History";
import drugStore from "../../../../state/store/codebuilder/drugs";

import { ShowWarning } from "../../../../componentsV2/Common/Toast";
import { Confirm } from "../../../../componentsV2/Common/Confirm";
import { getCodeBuilderLibrarySearchQuery } from "../../../../utils";
import session from "../../../../state/store/session.js";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import { FormControlLabel } from "@mui/material";

export const Search = observer(({ clearSelection }) => {
    const [prevQuery, setPreviousQuery] = React.useState(null);

    const [keyword, setKeyword] = React.useState("");
    const [codeName, setCodeName] = React.useState("");
    const [userId, setUserId] = React.useState("");
    const [favoriteOnly, setFavoriteOnly] = React.useState(false);

    React.useEffect(() => {
        setKeyword(drugStore.query?.keyword ?? "");
        setCodeName(drugStore.query?.codeName ?? "");
        setUserId(drugStore.query?.userId ?? "");
        setFavoriteOnly(drugStore.query?.favoriteOnly ?? false);
    }, []);

    function getQuery() {
        drugStore.setQuery(keyword, codeName, userId, favoriteOnly);
        return getCodeBuilderLibrarySearchQuery(
            keyword,
            codeName,
            userId,
            favoriteOnly ? session.loggedInUser : ""
        );
    }

    const submit = async event => {
        event.preventDefault();

        const query = getQuery();

        // This is to ensure that if a user clears all input by hand and presses the search button
        // then the default search API `.loadUsersRecords()` gets triggered.
        if (!query && query === prevQuery) {
            ShowWarning("Please provide a search filter");
            return;
        }

        // However, user cannot press the search button over and over again if they have not changed the search filter
        if (query === prevQuery) {
            ShowWarning("Please change any search filter to continue");
            return;
        }

        setPreviousQuery(query);
        if (!query) {
            await drugStore.loadUsersRecords();
        } else {
            await drugStore.searchDrugBank(query);
        }

        if (clearSelection) {
            clearSelection();
        }
    };

    const resetFilters = () => {
        setKeyword("");
        setCodeName("");
        setUserId("");
        setFavoriteOnly(false);
        setPreviousQuery("");
        clearSelection();
        drugStore.resetQuery();
    };

    const clearResults = async () => {
        const { isConfirmed } = await Confirm(
            "Reset Search",
            "Are you sure you want to reset search?"
        );

        if (isConfirmed) {
            resetFilters();
        }
    };

    const handleFavoriteOnlyChange = event => {
        setFavoriteOnly(event.target.checked);
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
                <form onSubmit={submit}>
                    <div
                        id="filters"
                        style={{
                            display: "grid",
                            justifyContent: "space-around",
                            gridTemplateColumns: "25% 25% 25% 4%",
                        }}
                    >
                        <Input
                            name="Search Tags"
                            label="Search Tags"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            fullWidth={false}
                            size="small"
                        />

                        <Input
                            name="Drug Code"
                            label="Drug code List"
                            fullWidth={false}
                            value={codeName}
                            onChange={e => setCodeName(e.target.value)}
                            size="small"
                        />

                        <Input
                            name="Created By"
                            label="Created By"
                            fullWidth={false}
                            value={userId}
                            onChange={e => setUserId(e.target.value)}
                            size="small"
                        />

                        <Tooltip title="Reset search" aria-label="Reset search">
                            <HistoryIcon
                                style={{
                                    marginTop: "23px",
                                    position: "relative",
                                    cursor: "pointer",
                                }}
                                onClick={clearResults}
                            />
                        </Tooltip>
                    </div>
                    <div
                        id="show-only-favorite-codes"
                        style={{
                            display: "grid",
                            justifyContent: "space-around",
                            gridTemplateColumns: "25% 25% 25% 4%",
                        }}
                    >
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={favoriteOnly}
                                        onChange={handleFavoriteOnlyChange}
                                    />
                                }
                                label="Show only favorite codes"
                            />
                        </FormGroup>
                    </div>
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
                            disabled={drugStore.loading}
                        >
                            {drugStore.loading ? "Loading..." : "Search"}
                        </Button>
                    </div>
                </form>
            </Paper>
        </Box>
    );
});
