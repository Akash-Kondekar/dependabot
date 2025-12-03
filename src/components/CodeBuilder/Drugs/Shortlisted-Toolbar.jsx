import React from "react";
import { observer } from "mobx-react";

import withStyles from "@mui/styles/withStyles";
import { IconButton, Tooltip } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
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
    function removeSelected() {
        drugStore.removeShortlisted(selectedRows);
        ShowSuccess(`Deleted ${selectedRows.data?.length} code(s)`);
        setSelectedRows([]);
    }

    return (
        <div className={classes.iconContainer}>
            <Tooltip title={"Delete selected"}>
                <IconButton className={classes.iconButtonDelete} onClick={removeSelected}>
                    <DeleteIcon className={classes.icon} />
                </IconButton>
            </Tooltip>
        </div>
    );
});
export default withStyles(defaultStyles, {
    name: "CustomToolbarSelect",
})(CustomToolbarSelect);
