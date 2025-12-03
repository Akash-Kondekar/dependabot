import { getAlert } from "./AlertProvider";

export const Confirm = (
    title = "Are you sure?",
    text = "You want to continue",
    icon = "warning"
) => {
    return new Promise(resolve => {
        getAlert()({
            type: "confirm",
            title,
            text,
            icon,
            resolve: ({ isConfirmed }) => resolve({ isConfirmed }),
        });
    });
};
