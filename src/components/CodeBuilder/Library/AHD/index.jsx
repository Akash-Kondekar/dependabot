import React from "react";
import { observer } from "mobx-react";

import MUIDataTable from "mui-datatables";
import ahdStore from "../../../../state/store/codebuilder/ahd";

export const columnsForAHDCodesTable = [
    {
        name: "ahdcode",
        label: "AHD code",
        options: {
            filter: true,
            filterType: "textField",
        },
    },
    {
        name: "datafile",
        label: "Datafile",
        options: {
            filter: true,
            filterType: "textField",
        },
    },
    {
        name: "description",
        label: "Description",
        options: {
            filter: true,
            filterType: "textField",
        },
    },
    {
        name: "data1",
        label: "Data1",
        options: {
            filter: true,
            filterType: "textField",
        },
    },
    {
        name: "data2",
        label: "Data2",
        options: {
            filter: true,
            filterType: "textField",
        },
    },
    {
        name: "data3",
        label: "Data3",
        options: {
            filter: true,
            filterType: "textField",
        },
    },
    {
        name: "data4",
        label: "Data4",
        options: {
            filter: true,
            filterType: "textField",
        },
    },
    {
        name: "data5",
        label: "Data5",
        options: {
            filter: true,
            filterType: "textField",
        },
    },
    {
        name: "data6",
        label: "Data6",
        options: {
            filter: true,
            filterType: "textField",
        },
    },
    {
        name: "dbname",
        label: "Dbname",
        options: {
            filter: true,
            filterType: "multiselect",
        },
    },
];

export const optionsForAHDCodes = {
    filter: true,
    viewColumns: true,
    filterType: "textField",
    filterArrayFullMatch: false,
    responsive: "vertical",
    rowsPerPage: 20,
    download: false,
    selectableRows: "none",
    print: false,
    enableNestedDataAccess: ".",
    rowsPerPageOptions: [10, 20, 100],
    tableBodyMaxHeight: "500px",
    setTableProps: () => {
        return { size: "small" };
    },
};

const AHDCodesLibrary = observer(() => {
    React.useEffect(() => {
        async function fetchAHDCodes() {
            await ahdStore.load();
        }

        fetchAHDCodes();
    }, []);

    return (
        <MUIDataTable
            columns={columnsForAHDCodesTable}
            data={ahdStore.list?.slice()}
            options={optionsForAHDCodes}
        />
    );
});

export default AHDCodesLibrary;
