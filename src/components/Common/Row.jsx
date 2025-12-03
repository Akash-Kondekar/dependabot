import React from "react";
import { FormGroup, FormLabel, Grid2 as Grid } from "@mui/material";

export const Row = ({ label, children, required = false, itemSizeOne = 6, itemSizeTwo = 6 }) => {
    return (
        <FormGroup row={true}>
            <Grid container size={12}>
                <Grid style={{ alignSelf: "center" }} size={itemSizeOne}>
                    <FormLabel component="legend" required={required}>
                        {label}
                    </FormLabel>
                </Grid>
                <Grid size={itemSizeTwo}>{children}</Grid>
            </Grid>
        </FormGroup>
    );
};
