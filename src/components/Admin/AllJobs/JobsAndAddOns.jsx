import React, { useMemo } from "react";
import { Copy, Dropdown } from "../../Common";
import { observer } from "mobx-react";
import {
    adminJobsAddonsSelectOptions,
    baseMRTOptions,
    columnNames,
    GetIconForThisStatus,
    GetJobStatusDesc,
    JOBS,
    STATUS_CHANGE_SUCCESS,
    UPDATE_STATUS_CONFIRMATION,
    UPDATE_STATUS_TITLE,
} from "../../../constants";
import { addSlNo } from "../../../utils";
import session from "../../../state/store/session";
import { MaterialReactTable } from "material-react-table";
import { MRTDataTableTitle } from "../../Common/MRTDataTableTitle.jsx";
import { Stack } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { Confirm } from "../../../componentsV2/Common/Confirm";
import { ShowSuccess } from "../../../componentsV2/Common/Toast";

export const JobsAndAddOns = observer(({ results, title, updateStatus, jobType }) => {
    return (
        <div>
            <DisplayJobsAndAddOns
                results={results}
                title={title}
                updateStatus={updateStatus}
                jobType={jobType}
            />
        </div>
    );
});

export const DisplayJobsAndAddOns = observer(({ results, title, updateStatus, jobType }) => {
    const { isAdmin, isModerator } = session;

    const dataWithSlNo = addSlNo(results);

    const columns = useMemo(
        () => [
            {
                accessorKey: columnNames.SL_NO.name,
                header: columnNames.SL_NO.label,
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                maxSize: 30,
            },
            {
                accessorKey: columnNames.ID.name,
                header: columnNames.ID.label,
                maxSize: 30,
                Cell: ({ cell }) => {
                    const value = cell.renderValue();
                    return (
                        <>
                            <Stack
                                direction="row"
                                sx={{
                                    justifyContent: "flex-start",
                                    alignItems: "center",
                                }}
                            >
                                <Tooltip title={value}>{value?.substring(0, 8)}</Tooltip>
                                <Stack
                                    className="copy-button"
                                    sx={{
                                        visibility: "hidden",
                                    }}
                                >
                                    <Copy text={value} icon={true} />
                                </Stack>
                            </Stack>
                        </>
                    );
                },
                filterFn: "contains",
            },
            {
                accessorKey: columnNames.PROJECT_ID.name,
                header: columnNames.PROJECT_ID.label,
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                maxSize: 30,
                hideColumn: jobType === JOBS,
            },
            {
                accessorKey: columnNames.PROJECT_NAME.name,
                header: columnNames.PROJECT_NAME.label,
                filterVariant: "autocomplete",
            },
            {
                accessorKey: columnNames.STUDY_ID.name,
                header: columnNames.STUDY_ID.label,
                enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                maxSize: 30,
            },
            {
                accessorKey: columnNames.STUDY_NAME.name,
                header: columnNames.STUDY_NAME.label,
                filterFn: "contains",
            },
            {
                accessorKey: "statusDescription",
                header: columnNames.STATUS.label,
                enableSorting: true,
                enableColumnFilter: true,
                filterVariant: "select",
                Cell: ({ row }) => {
                    const rowData = row.original;
                    if (isModerator) {
                        return <GetIconForThisStatus desc={GetJobStatusDesc(rowData?.status)} />;
                    } else if (isAdmin) {
                        return (
                            <Dropdown
                                size="small"
                                ddLabel=""
                                sx={{ maxWidth: "100px" }}
                                labelName={columnNames.STATUS.label}
                                labelValue=""
                                value={rowData.status}
                                inputProps={{ readOnly: !isAdmin }}
                                handleChange={async e => {
                                    const { isConfirmed } = await Confirm(
                                        UPDATE_STATUS_TITLE,
                                        UPDATE_STATUS_CONFIRMATION
                                    );
                                    if (isConfirmed) {
                                        const success = await updateStatus(
                                            rowData.projectID,
                                            rowData.jobID,
                                            e.target.value,
                                            jobType
                                        );
                                        success && ShowSuccess(STATUS_CHANGE_SUCCESS);
                                    }
                                }}
                                dropdownOptions={adminJobsAddonsSelectOptions}
                            />
                        );
                    }
                },
                size: 20,
            },
            {
                accessorKey: columnNames.DESIGN_BY.name,
                header: columnNames.DESIGN_BY.label,
                enableColumnFilter: true,
                filterVariant: "autocomplete",
                enableSorting: false,
            },
        ],
        []
    );

    return (
        <MaterialReactTable
            {...baseMRTOptions}
            columns={columns}
            data={dataWithSlNo}
            initialState={{
                density: "compact",
                columnVisibility: {
                    id: jobType === JOBS,
                },
            }}
            renderTopToolbarCustomActions={() => {
                return <MRTDataTableTitle title={title} />;
            }}
        />
    );
});
