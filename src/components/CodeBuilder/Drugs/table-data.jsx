import React from "react";

import { Button, FormGroup, FormLabel, TextField } from "@mui/material";
import CustomToolbarSelect from "./Toolbar";
import ShortlistedToolbar from "./Shortlisted-Toolbar";
import cloneDeep from "lodash/cloneDeep";

export const optionsDrugCodeList = {
    filter: true,
    selectableRows: "multiple",
    selectableRowsOnClick: true,
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

export const optionsShortlistedCodes = {
    filter: true,
    selectableRows: "multiple",
    selectableRowsOnClick: true,
    filterType: "textField",
    filterArrayFullMatch: false,
    responsive: "vertical",
    rowsPerPage: 50,
    rowsPerPageOptions: [50, 100, 200],
    tableBodyMaxHeight: "600px",
    enableNestedDataAccess: ".",
    confirmFilters: true,

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
export const columnsForDrugCodes = [
    {
        name: "dataid",
        label: "Drug Id",
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
        name: "bnf1",
        label: "BNF1",
        options: {
            filter: true,
            filterType: "textField",
        },
    },
    {
        name: "bnf2",
        label: "BNF2",
        options: {
            filter: true,
            filterType: "textField",
        },
    },
    {
        name: "bnf3",
        label: "BNF3",
        options: {
            filter: true,
            filterType: "textField",
        },
    },
    {
        name: "atc",
        label: "ATC code",
        options: {
            filter: true,
            filterType: "textField",
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
export const drugColumnsForCompareTable = cloneDeep(columnsForDrugCodes).map(item => {
    if (["bnf1", "bnf2", "bnf3", "atc"].includes(item.name)) {
        item.options.display = false;
    }
    return item;
});
