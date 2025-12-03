import PropTypes from "prop-types";
const { func, string } = PropTypes;

export const handleActionType = {
    primaryKeyForAction: string.isRequired,
    userIntension: string.isRequired,
    performUpdate: func.isRequired,
};
