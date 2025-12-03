import React from "react";
import { DisplayDataTable } from "../../../Common";
import { observer } from "mobx-react";
import summaryStore from "../../../../state/store/study/analytics/summary";
import { MUIDataTableDefaultOptions } from "../../../../constants";
import { formatDateFieldAndAddSlNo } from "../../../../utils";
import { Grid2 as Grid } from "@mui/material";

const DisplaySummary = observer(() => {
    React.useEffect(() => {
        (async () => {
            summaryStore.reset();

            await summaryStore.load();
        })();
    }, []);

    if (summaryStore.loading) {
        return "Loading...";
    }

    const CovariateIndexData = summaryStore.data?.map(item => item?.covariateIndex);
    const CovariateFilterOptions = [...new Set(CovariateIndexData)];

    const incPrevSummaryTableColumns = [
        {
            label: "Covariate",
            name: "covariate",
            options: {
                searchable: false,
                filterType: "dropdown",
                filterOptions: {
                    names: CovariateFilterOptions,
                    // Custom Logic: Using Covariate Index option selected from dropdown, filter covariate data
                    logic: (_, filters, row) => {
                        if (filters.length) return !row.includes(filters[0]);
                        return false;
                    },
                },
            },
        },
        { label: "Stratum", name: "stratum" },
        {
            label: "Overall",
            name: "overall",
            options: { filter: false, sort: false, searchable: false },
        },
        {
            label: "Sex F",
            name: "sexF",
            options: { filter: false, sort: false, searchable: false },
        },
        {
            label: "Sex M",
            name: "sexM",
            options: { filter: false, sort: false, searchable: false },
        },

        {
            label: "Sex I",
            name: "sexI",
            options: { filter: false, sort: false, searchable: false },
        },
        {
            label: "Covariate Index",
            name: "covariateIndex",
            options: {
                filter: false,
                display: true,
                searchable: true,
                setCellHeaderProps: () => ({ style: { display: "none" } }),
                // MUI display false option disables the search capability for this column, which is required for our use where we want to search the value but hide
                //display on UI. Hence adding custom render with empty element.
                customBodyRender: (__, ___, _) => {
                    return <div />;
                },
            },
        },
    ];

    return (
        <Grid container justifyContent={"center"} sx={{ paddingTop: "8rem" }}>
            <Grid
                size={{
                    xs: 12,
                    md: 11,
                    lg: 11,
                    xl: 10,
                }}
            >
                <DisplayDataTable
                    title="Summary"
                    columns={incPrevSummaryTableColumns}
                    data={formatDateFieldAndAddSlNo(summaryStore.summaryList, "submittedOn")}
                    options={MUIDataTableDefaultOptions}
                    sx={{ width: "max-content" }}
                />
            </Grid>
        </Grid>
    );
});

export default DisplaySummary;
