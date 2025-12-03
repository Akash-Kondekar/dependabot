import React from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TextField } from "@mui/material";
import enLocale from "date-fns/locale/en-GB";
import { DateTimePicker } from "@mui/x-date-pickers";
import { DATE_TIME_FORMAT } from "../../config";

export const DisplayDateTime = ({
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
            <DateTimePicker
                variant="inline"
                format={DATE_TIME_FORMAT}
                value={selectedDate}
                renderInput={params => <TextField fullWidth={true} margin="normal" {...params} />}
                onChange={handleDateChange}
                onKeyPress={() => {
                    handleKeypress();
                }}
                KeyboardButtonProps={{
                    "aria-label": ariaLabel,
                }}
                slotProps={{
                    textField: {
                        variant: "outlined",
                        size: "medium",
                        margin: "normal",
                        fullWidth: true,
                        "aria-label": "Date",
                    },
                }}
                id={name}
                label={label}
                minDate={minDate}
                {...props}
            />
        </LocalizationProvider>
    );
};
