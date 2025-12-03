import React from "react";
import { Tooltip } from "@mui/material";
import { useStyles } from "../useStyles";
import { InfoOutlined } from "@mui/icons-material";
import { AHD_BEAN_LIST_LABEL } from "../../constants/index.jsx";
import { createCodeObject } from "../../utils/index.jsx";

const extractCodes = (rowData, type) => {
    if (type === AHD_BEAN_LIST_LABEL) {
        const need = createCodeObject();

        return Object.keys(need)
            .filter(key => rowData[key] === true)
            .map(e => e + "-" + rowData[need[e]])
            .join("\n");
    } else {
        return Object.keys(rowData?.codes)
            .map(key => `${key} : ${rowData?.codes[key]}`)
            .join("\n");
    }
};

export const GetCodes = ({ rowData, type }) => {
    const classes = useStyles();

    const tip = rowData !== undefined ? extractCodes(rowData, type) : "";

    return (
        <div className={classes.getCodes}>
            <Tooltip
                title={
                    tip ? (
                        <div
                            style={{
                                whiteSpace: "pre-wrap",
                                maxHeight: "500px",
                                overflow: "auto",
                            }}
                        >
                            {tip}
                        </div>
                    ) : (
                        "Loading.."
                    )
                }
                placement="right"
                aria-label="list of Medical codes"
            >
                <InfoOutlined />
            </Tooltip>
        </div>
    );
};
