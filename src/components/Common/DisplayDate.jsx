import React from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import enLocale from "date-fns/locale/en-GB";

export const DisplayDate = ({
    selectedDate,
    name,
    handleDateChange,
    ariaLabel,
    label,
    minDate,
    ...props
}) => {
    const handleKeypress = () => {
        return false;
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enLocale}>
            <DatePicker
                variant="inline"
                format="dd/MM/yyyy"
                value={selectedDate ? new Date(selectedDate) : null}
                slotProps={{
                    textField: {
                        variant: "outlined",
                        size: "medium",
                        margin: "normal",
                        fullWidth: true,
                        "aria-label": "Date",
                    },
                }}
                onChange={handleDateChange}
                onKeyPress={() => {
                    handleKeypress();
                }}
                KeyboardButtonProps={{
                    "aria-label": ariaLabel,
                }}
                id={name}
                label={label}
                minDate={minDate}
                {...props}
            />
        </LocalizationProvider>
    );
};
