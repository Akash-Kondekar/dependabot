import React from "react";
import {
    ARTICLE_PUBLISHED_TABLE_HEADING,
    MUIDataTableDefaultOptions,
} from "../../../constants/index";
import { DisplayDataTable } from "../../Common";

export const DisplayPublications = ({ columns, data }) => {
    return (
        <DisplayDataTable
            title={ARTICLE_PUBLISHED_TABLE_HEADING}
            columns={columns}
            data={data}
            options={MUIDataTableDefaultOptions}
        />
    );
};
