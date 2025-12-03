import { Chip, Typography } from "@mui/material";
import React, { useState } from "react";
import Remove from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

export const DataNotFound = ({ dataNotFound }) => {
    const [showMore, setShowMore] = useState(false);
    const THRESHOLD = 30;
    return (
        <>
            <Typography color="error">
                The following {dataNotFound.length} code(s) were not imported as they are not
                present in the dictionary
            </Typography>
            {(showMore ? dataNotFound : dataNotFound.slice(0, THRESHOLD))?.map(val => {
                return <Chip key={val} style={{ margin: "2px" }} size="small" label={val} />;
            })}
            {dataNotFound.length > THRESHOLD && (
                <Chip
                    onClick={() => setShowMore(!showMore)}
                    icon={showMore ? <Remove fontSize="small" /> : <AddIcon fontSize="small" />}
                    style={{ margin: "2px" }}
                    color="primary"
                    size="small"
                    label={showMore ? "show less" : `${dataNotFound.length - THRESHOLD} more`}
                />
            )}
        </>
    );
};
