import React, { useMemo } from "react";
import { formatDateFieldAndAddSlNo } from "../../../utils";
import { observer } from "mobx-react";
import { MaterialReactTable } from "material-react-table";
import { baseMRTOptions, columnNames, GetIconForThisStatus } from "../../../constants/index.jsx";
import { MRTDataTableTitle } from "../../Common/MRTDataTableTitle.jsx";

export const Analytics = observer(({ results }) => {
    const processedData = useMemo(
        () => formatDateFieldAndAddSlNo(results, "submittedOn"),
        [results]
    );

    const columns = useMemo(
        () => [
            {
                header: columnNames.SL_NO.label,
                accessorKey: columnNames.SL_NO.name,
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                maxSize: 30,
            },
            {
                header: columnNames.PROJECT_ID.label,
                accessorKey: columnNames.PROJECT_ID.name,
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                maxSize: 30,
            },
            {
                header: columnNames.PROJECT_NAME.label,
                accessorKey: columnNames.PROJECT_NAME.name,
                filterFn: "contains",
            },
            {
                header: columnNames.STUDY_ID.label,
                accessorKey: columnNames.STUDY_ID.name,
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                maxSize: 30,
            },
            {
                header: columnNames.STUDY_NAME.label,
                accessorKey: columnNames.STUDY_NAME.name,
                filterFn: "contains",
            },
            {
                header: columnNames.STATUS.label,
                accessorKey: columnNames.STATUS.name,
                filterVariant: "select",
                Cell: ({ cell }) => <GetIconForThisStatus desc={cell.getValue()} />,
            },
            {
                header: columnNames.DESIGN_BY.label,
                accessorKey: columnNames.DESIGN_BY.name,
                filterVariant: "autocomplete",
            },
            {
                header: columnNames.CREATED_ON.label,
                accessorKey: columnNames.CREATED_ON.name,
                filterFn: "contains",
            },
        ],
        []
    );

    return (
        <MaterialReactTable
            columns={columns}
            data={processedData}
            enableColumnFilters={processedData?.length > 0}
            enableSorting={processedData?.length > 0}
            enableColumnActions={processedData?.length > 0}
            showGlobalFilter={processedData?.length > 0}
            {...baseMRTOptions}
            renderTopToolbarCustomActions={() => {
                return <MRTDataTableTitle title="Analytics" />;
            }}
        />
    );
});
