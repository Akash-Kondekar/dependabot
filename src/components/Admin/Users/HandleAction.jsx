import React from "react";
import IconButton from "@mui/material/IconButton";
import { handleActionType } from "./types/Users.types";
import RestoreIcon from "@mui/icons-material/Restore";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { REACTIVATE, USERSTATUS } from "../../../constants";
import { Confirm } from "../../../componentsV2/Common/Confirm";

export const HandleAction = ({
    primaryKeyForAction,
    userIntension,
    performUpdate,
    isPromotable,
    performPromoteOrDemoteAction,
}) => {
    let Icon = DeleteIcon; // Default Action for Active User
    let RolePromoteOrDemote = RemoveIcon; // Default Action for Moderator

    //TODO: Setting title and message to delete when user intension is to delete a user is not working currently because of component rendering twice
    //and there by re-writing it with initial value (Account settings info). For now keeping the code as below until.
    //Identify the issue and refactor to code to make title and message dynamic

    let title = "";
    let message = "";

    if (userIntension === USERSTATUS.DELETE) {
        title = "Delete User";
        message =
            "Are you sure you want to delete this user? This action will also remove the user from the client if mapped.";
    }
    if (userIntension === USERSTATUS.REACTIVATE) {
        title = "Restore User";
        message = "Do you want to restore this user?";
    }

    let newRole = "User";
    if (userIntension === REACTIVATE) {
        Icon = RestoreIcon;
    }
    if (isPromotable === true) {
        RolePromoteOrDemote = AddIcon;
        newRole = "Moderator";
    }

    return (
        <>
            <IconButton
                aria-label="delete"
                onClick={async () => {
                    const { isConfirmed } = await Confirm(title, message);
                    if (isConfirmed) {
                        performUpdate(primaryKeyForAction, userIntension);
                    }
                }}
                size="large"
            >
                <Icon />
            </IconButton>

            {Icon === DeleteIcon && (
                <IconButton
                    onClick={async () => {
                        const { isConfirmed } = await Confirm(
                            "Account Settings",
                            "Are you sure you want change the current status?"
                        );
                        if (isConfirmed) {
                            performPromoteOrDemoteAction(primaryKeyForAction, newRole);
                        }
                    }}
                    size="large"
                >
                    <RolePromoteOrDemote />
                </IconButton>
            )}
        </>
    );
};
HandleAction.propTypes = handleActionType;
