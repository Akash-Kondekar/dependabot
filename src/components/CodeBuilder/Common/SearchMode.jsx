import React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { observer } from "mobx-react";
import { CODE_BUILDER_SEARCH_MODE as SEARCH_MODE } from "../../../constants";
import PropTypes from "prop-types";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import Tooltip from "@mui/material/Tooltip";
import { Grid2 as Grid } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { Copy } from "../../Common";

const SearchMode = observer(
    ({ searchType, updateSearchType, disabled, clearResults, toDisplay, advanced }) => {
        const handleChange = (event, value) => {
            if (value !== null) {
                updateSearchType(value);
            }
        };

        return (
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                <Grid style={{ flexGrow: 1 }}>
                    <ToggleButtonGroup
                        color="primary"
                        value={searchType}
                        exclusive
                        onChange={handleChange}
                        aria-label="Search Type"
                        size="small"
                        disabled={disabled}
                    >
                        <ToggleButton value={SEARCH_MODE.SIMPLE}>Simple</ToggleButton>
                        <ToggleButton value={SEARCH_MODE.ADVANCED}>Advanced</ToggleButton>
                        <ToggleButton value={SEARCH_MODE.UPLOAD}>Upload</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
                <Grid>
                    {advanced && <Copy text={toDisplay} icon={true} showTooltip={true} />}
                    <Tooltip title="Clear Workspace" aria-label="Clear Workspace">
                        <IconButton aria-label="delete" size="large" onClick={clearResults}>
                            <ClearAllIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
        );
    }
);

export default SearchMode;

SearchMode.propTypes = {
    searchType: PropTypes.string,
    updateSearchType: PropTypes.func,
    disabled: PropTypes.bool,
};
