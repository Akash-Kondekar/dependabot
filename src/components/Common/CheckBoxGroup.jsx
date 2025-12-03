import React from "react";
import { Checkbox, FormControlLabel, Box } from "@mui/material";

export const CheckBoxGroup = ({ checkboxData, label, handleOnChecked, value, ...props }) => {
    const children = (
        <Box label={label} sx={{ display: "flex", flexDirection: "column", ml: 3 }}>
            {checkboxData.map((item, index) => {
                return (
                    <FormControlLabel
                        label={item?.label}
                        key={index}
                        control={
                            <Checkbox
                                checked={value?.[index] || false}
                                onChange={e => handleOnChecked(e, index, item)}
                            />
                        }
                        {...props}
                    />
                );
            })}
        </Box>
    );

    return <div style={{ flexBasis: "55%" }}>{children}</div>;
};
