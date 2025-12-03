import React from "react";
import MUIDataTable from "mui-datatables";

export const DisplayDataTable = ({ title, columns, data, options, ...props }) => {
    return (
        <MUIDataTable title={title} columns={columns} data={data} options={options} {...props} />
    );
};
