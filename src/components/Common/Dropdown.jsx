import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export const Dropdown = ({
    formControlClassName,
    variant = "outlined",
    fullWidth = true,
    labelName,
    labelValue,
    ddLabel,
    value,
    handleChange,
    dropdownOptions,
    ...props
}) => {
    return (
        <>
            <FormControl
                size="small"
                fullWidth={fullWidth}
                variant={variant}
                className={formControlClassName}
            >
                {props.styles ? (
                    //custom style is required to prevent default behavior where label value will sit on top left corner
                    //When clicked on dropdown
                    <InputLabel id={labelName} sx={{ ...props.styles }}>
                        {labelValue}
                    </InputLabel>
                ) : (
                    <InputLabel id={labelName}>{labelValue}</InputLabel>
                )}
                <Select
                    labelId={labelName}
                    value={value}
                    onChange={handleChange}
                    label={ddLabel}
                    {...props}
                >
                    {Object.keys(dropdownOptions).map(value => {
                        return (
                            <MenuItem
                                key={dropdownOptions[value].value + dropdownOptions[value].label}
                                value={dropdownOptions[value].value}
                            >
                                {dropdownOptions[value].label}
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
        </>
    );
};
