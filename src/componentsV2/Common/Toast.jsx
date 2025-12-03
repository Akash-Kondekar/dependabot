import { CONTACT_ADMIN_MESSAGE, NOTIFICATION_TYPE } from "../../constants";
import { getAlert } from "./AlertProvider";

export const ShowSuccess = (title = "ShowSuccess", text = "", width) => {
    getAlert()({ type: NOTIFICATION_TYPE.SUCCESS, title, text, width });
    return true;
};

export const ShowWarning = (title = "Warning") => {
    getAlert()({ type: NOTIFICATION_TYPE.WARNING, title });
    return true;
};

export const ShowError = (title = CONTACT_ADMIN_MESSAGE) => {
    getAlert()({ type: NOTIFICATION_TYPE.ERROR, title, autoClose: 4000 });
    return false;
};
