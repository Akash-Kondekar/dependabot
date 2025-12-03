import React from "react";

import { Button, FormGroup, FormLabel, TextField } from "@mui/material";
import CustomToolbarSelect from "./Toolbar";
import ShortlistedToolbar from "./Shortlisted-Toolbar";
import cloneDeep from "lodash/cloneDeep";

export const optionsMasterCodeList = {
    filter: true,
    selectableRows: "multiple",
    filterType: "textField",
    filterArrayFullMatch: false,
    responsive: "vertical",
    rowsPerPage: 50,
    download: false,
    print: false,
    enableNestedDataAccess: ".",
    rowsPerPageOptions: [50, 100, 200],
    tableBodyMaxHeight: "500px",
    confirmFilters: true,
    selectableRowsOnClick: true,
    rowsSelected: [],
    customFilterDialogFooter: (_, applyNewFilters) => {
        return (
            <div style={{ marginTop: "40px" }}>
                <Button variant="contained" onClick={applyNewFilters}>
                    Apply Filters
                </Button>
            </div>
        );
    },

    customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
        return (
            <CustomToolbarSelect
                selectedRows={selectedRows}
                displayData={displayData}
                setSelectedRows={setSelectedRows}
            />
        );
    },
};

// This table is used for both drugs and medical
export const optionsForLoadedCodesTable = {
    filter: true,
    selectableRows: "none",
    filterType: "textField",
    filterArrayFullMatch: false,
    responsive: "vertical",
    rowsPerPage: 50,
    download: false,
    print: false,
    enableNestedDataAccess: ".",
    rowsPerPageOptions: [50, 100, 200],
    tableBodyMaxHeight: "600px",
    // These next two options allow you to make it so filters need to be confirmed.
    confirmFilters: true,
    // Calling the applyNewFilters parameter applies the selected filters to the table
    customFilterDialogFooter: (currentFilterList, applyNewFilters) => {
        return (
            <div style={{ marginTop: "40px" }}>
                <Button variant="contained" onClick={applyNewFilters}>
                    Apply Filters
                </Button>
            </div>
        );
    },
};

export const optionsShortlistedCodes = {
    filter: true,
    selectableRows: "multiple",
    filterType: "textField",
    filterArrayFullMatch: false,
    responsive: "vertical",
    rowsPerPage: 10,
    dense: false,
    rowsPerPageOptions: [10, 100, 200],
    tableBodyMaxHeight: "600px",
    enableNestedDataAccess: ".",
    confirmFilters: true,
    selectableRowsOnClick: true,
    print: false,
    setTableProps: () => {
        return {
            size: "small",
        };
    },
    // Calling the applyNewFilters parameter applies the selected filters to the table
    customFilterDialogFooter: (_, applyNewFilters) => {
        return (
            <div style={{ marginTop: "40px" }}>
                <Button variant="contained" onClick={applyNewFilters}>
                    Apply Filters
                </Button>
            </div>
        );
    },
    textLabels: {
        body: {
            noMatch: "Sorry, no matching records found",
            toolTip: "Sort",
            columnHeaderTooltip: column => `Sort for ${column.label}`,
        },
        pagination: {
            next: "Next Page",
            previous: "Previous Page",
            rowsPerPage: "Rows per page:",
            displayRows: "of",
        },
        toolbar: {
            search: "Search",
            downloadCsv: "Download CSV",
            print: "Print",
            viewColumns: "View Columns",
            filterTable: "Filter Table",
        },
        filter: {
            all: "All",
            title: "FILTERS",
            reset: "RESET",
        },
        viewColumns: {
            title: "Show Columns",
            titleAria: "Show/Hide Table Columns",
        },
        selectedRows: {
            text: "row(s) selected",
            delete: "Delete",
            deleteAria: "Delete Selected Rows",
        },
        onDownload: (buildHead, buildBody, columns, data) => buildHead(columns) + buildBody(data),
    },
    customToolbarSelect: (selectedRows, displayData, setSelectedRows) => (
        <ShortlistedToolbar
            selectedRows={selectedRows}
            displayData={displayData}
            setSelectedRows={setSelectedRows}
        />
    ),
    download: false,
};

// This is considered as base columns for Results table
// Acts also as a Base Object for Compare Code Feature
export const columnsForMedicalCodes = [
    {
        name: "dataid",
        label: "Medical Id",
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
            filterType: "textField", // set filterType's at the column level
        },
    },
    {
        name: "clinicalcode1", //`${["bnf1", "bnf2"]}`,
        label: "Medical code",
        options: {
            filter: true,
            filterType: "textField", // set filterType's at the column level
        },
    },
    {
        name: "clinicalcode2", //`${["bnf1", "bnf2"]}`,
        label: "SnomedCT code",
        options: {
            filter: true,
            filterType: "textField", // set filterType's at the column level
        },
    },
    {
        name: "frequency",
        label: "Frequency",
        options: {
            filter: true,
            filterType: "custom",

            customFilterListOptions: {
                render: v => {
                    if (v[0] && v[1]) {
                        return [`Min Frequency: ${v[0]}`, `Max Frequency: ${v[1]}`];
                    } else if (v[0]) {
                        return `Min Frequency: ${v[0]}`;
                    } else if (v[1]) {
                        return `Max Frequency: ${v[1]}`;
                    }
                    return [];
                },
                update: (filterList, filterPos, index) => {
                    if (filterPos === 0) {
                        filterList[index].splice(filterPos, 1, "");
                    } else if (filterPos === 1) {
                        filterList[index].splice(filterPos, 1);
                    } else if (filterPos === -1) {
                        filterList[index] = [];
                    }

                    return filterList;
                },
            },
            filterOptions: {
                names: [],
                logic(freq, filters) {
                    if (filters[0] && filters[1]) {
                        return freq < filters[0] || freq > filters[1];
                    } else if (filters[0]) {
                        return freq < filters[0];
                    } else if (filters[1]) {
                        return freq > filters[1];
                    }
                    return false;
                },
                display: (filterList, onChange, index, column) => (
                    <div>
                        <FormLabel>Frequency</FormLabel>
                        <FormGroup row>
                            <TextField
                                label="min"
                                type="number"
                                value={filterList[index][0] || ""}
                                onChange={event => {
                                    filterList[index][0] = event.target.value;
                                    onChange(filterList[index], index, column);
                                }}
                                style={{ width: "45%", marginRight: "5%" }}
                            />
                            <TextField
                                label="max"
                                type="number"
                                value={filterList[index][1] || ""}
                                onChange={event => {
                                    filterList[index][1] = event.target.value;
                                    onChange(filterList[index], index, column);
                                }}
                                style={{ width: "45%" }}
                            />
                        </FormGroup>
                    </div>
                ),
            },
        },
    },
    {
        name: "dbname",
        label: "Database",
        options: {
            filter: true,
            filterType: "multiselect",
        },
    },
];

// Clone so that original columns will be not get impacted for search results table
export const medicalColumnsForCompareTable = cloneDeep(columnsForMedicalCodes).map(item => {
    if (["clinicalcode1", "clinicalcode2"].includes(item.name)) {
        item.options.display = false;
    }
    return item;
});
