import React from "react";
import { observer } from "mobx-react";

import withStyles from "@mui/styles/withStyles";
import { Button, IconButton, Tooltip } from "@mui/material";

import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import drugStore from "../../../state/store/codebuilder/drugs";
import { ShowSuccess } from "../../../componentsV2/Common/Toast";

const defaultStyles = {
    iconButton: {
        "&:hover": {
            color: "#3F51B5",
        },
    },
    iconButtonDelete: {
        "&:hover": {
            color: "#dc3545",
        },
    },
    iconContainer: {
        marginRight: "24px",
    },
    inverseIcon: {
        transform: "rotate(90deg)",
    },
};

const CustomToolbarSelect = observer(({ classes, selectedRows, setSelectedRows }) => {
    function deselectAll() {
        setSelectedRows([]);
    }

    function inverseSelection() {
        const nextSelectedRows = drugStore.masterCodeList?.reduce((nextSelectedRows, _, index) => {
            if (!selectedRows.data.find(selectedRow => selectedRow.index === index)) {
                nextSelectedRows.push(index);
            }

            return nextSelectedRows;
        }, []);

        setSelectedRows(nextSelectedRows);
    }

    function removeSelected() {
        drugStore.removeMasterCodes(selectedRows);
        ShowSuccess(`Deleted ${selectedRows.data?.length} code(s).`);

        setSelectedRows([]);
    }

    function addSelected() {
        const shortlistedCodes = [];
        const shortlistedIndexes = [];

        const dataIndexesToAdd = selectedRows.data.map(row => row.dataIndex);

        const requested = dataIndexesToAdd.length;

        dataIndexesToAdd
            .filter(index => {
                const itemToAdd = drugStore.masterCodeList[index];
                if (!itemToAdd) return false;

                // Check if an item with the same dataid AND dbname already exists
                return !drugStore.shortlistedCodes?.some(
                    shortlistedItem =>
                        shortlistedItem.dataid === itemToAdd.dataid &&
                        shortlistedItem.dbname === itemToAdd.dbname
                );
            })
            .map(value => {
                shortlistedCodes.push(drugStore.masterCodeList[value]);
                shortlistedIndexes.push(drugStore.masterCodeList[value]?.dataid);
            });

        drugStore.addToShortlistedCodes(shortlistedCodes);
        drugStore.addToShortlistedIndexes(shortlistedIndexes);

        const added = shortlistedCodes.length;
        const skipped = requested - added;

        skipped > 0
            ? ShowSuccess(`Added: ${added} code(s). Skipped: ${skipped} code(s).`)
            : ShowSuccess(`Added: ${added} code(s).`);

        setSelectedRows([]);
    }

    return (
        <div className={classes.iconContainer}>
            <Tooltip title={"Deselect All"}>
                <IconButton className={classes.iconButton} onClick={deselectAll}>
                    <IndeterminateCheckBoxIcon className={classes.icon} />
                </IconButton>
            </Tooltip>
            <Tooltip title={"Inverse selection"}>
                <IconButton className={classes.iconButton} onClick={inverseSelection}>
                    <CompareArrowsIcon className={[classes.icon, classes.inverseIcon].join(" ")} />
                </IconButton>
            </Tooltip>
            <Tooltip title={"Delete selected"}>
                <IconButton className={classes.iconButtonDelete} onClick={removeSelected}>
                    <DeleteIcon className={classes.icon} />
                </IconButton>
            </Tooltip>
            <Tooltip title={"Shortlist selected codes"}>
                <Button variant="outlined" size="small" endIcon={<AddIcon />} onClick={addSelected}>
                    Shortlist
                </Button>
            </Tooltip>
        </div>
    );
});

export default withStyles(defaultStyles, {
    name: "CustomToolbarSelect",
})(CustomToolbarSelect);
