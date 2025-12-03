//#region - Imports
import React from "react";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { useStyles } from "../useStyles";
import CssBaseline from "@mui/material/CssBaseline";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import extractJsonObject from "./Parser";

import { observer } from "mobx-react";

import { AddCodes } from "./AddCode";
import {
    BuildQuery,
    CardHeader,
    GetCodes,
    NumberInput,
    ShowError,
    ShowSuccess,
    StyledTableCell,
    StyledTableRow,
} from "../Common";

import {
    addSlNo,
    buildCodeIndex,
    formatDateForTooltip,
    getCodeModifiedOn,
    getDescriptionFromADHCode,
    getRowLastModifiedOn,
    isCodeOutOfSync,
    prepareAHDCodes,
} from "../../utils";

import InfoIcon from "@mui/icons-material/Info";
import {
    AHD_BEAN_LIST_LABEL,
    BASELINE_AHD,
    BASELINE_DRUGS,
    BASELINE_MEDS,
    baselineLeftMarginTooltip,
    baselineRightMarginTooltip,
    CASE_CONTROL,
    CLINICAL_CODELIST_GENERIC_LABEL,
    CLINICAL_CODELIST_MEDICAL_LABEL,
    CLINICAL_CODELIST_THERAPY_LABEL,
    CROSS_SECTIONAL,
    INC_PREV,
    STUDY_BASELINE_LOGIC,
    STUDY_BASELINE_LOGIC_FOR_CASE_CONTROL,
    STUDY_BASELINE_LOGIC_FOR_CROSS_SECTIONAL,
    STUDY_BASELINE_LOGIC_FOR_INC_PREV,
    STUDY_BASELINE_RECORD_TYPES,
    UNEDITABLE_FILE,
} from "../../constants";

import FilterListIcon from "@mui/icons-material/FilterList";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import { NumberInputAdornment } from "../Common/NumberInputAdornment";
import studyDatabase from "../../state/store/study/database";
import PropTypes from "prop-types";

const CollectCodes = observer(({ baseline, type, fileType, studyDesign, codes }) => {
    const [queryValue, setQueryValue] = React.useState({});
    const [open, setOpen] = React.useState(false);
    const [rowSelected, setRowSelected] = React.useState(false);

    const recordTypeOptions = [
        { value: 1, label: "Latest", tooltip: "Latest event before the index date" },
        { value: 2, label: "Earliest", tooltip: "Earliest event before the index date" },
        {
            value: 3,
            label: "First ever",
            tooltip:
                "First event ever recorded regardless of index date. This event might have occurred outside the study period",
        },
    ];

    const getIdentifier = type => (type === CLINICAL_CODELIST_GENERIC_LABEL ? "id" : "ahdCode");

    const handleClose = () => {
        setOpen(false);
    };

    const handleBuildQueryModal = row => {
        row.query = extractJsonObject(row.userQuery);
        setRowSelected(row);
        setOpen(true);
    };

    const handleQueryChange = query => {
        const identifier = getIdentifier(type);
        const { sqlQuery } = query;

        for (let index = 0; index < baseline.data.ahdBeanList.length; index++) {
            const e = baseline.data.ahdBeanList[index];
            const i = index;
            if (
                e[identifier] === rowSelected._id &&
                rowSelected.matchingReq === false &&
                rowSelected.fileType === fileType &&
                rowSelected.exposureType !== UNEDITABLE_FILE &&
                rowSelected.incl === true &&
                e.uniqueKey === rowSelected.uniqueKey
            ) {
                baseline.setValue("userQuery", AHD_BEAN_LIST_LABEL, i, sqlQuery);
                break;
            }
        }

        handleClose();
    };

    const props = {
        open,
        handleClose,
        queryValue,
        setQueryValue,
        jsonQuery: rowSelected.query,
        description: getDescriptionFromADHCode(prepareAHDCodes(rowSelected).join() ?? ""),
        callback: handleQueryChange,
    };

    const handleSelectChange = (item, newRowData, value) => {
        for (let index = 0; index < baseline.data[type].length; index++) {
            const e = baseline.data[type][index];
            const i = index;

            if (e.uniqueKey === newRowData.uniqueKey) {
                baseline.setValue(item, type, i, value);
                break;
            }
        }
    };

    const handleInputChange = (uniqueKey, item, value) => {
        for (let index = 0; index < baseline.data[type].length; index++) {
            const e = baseline.data[type][index];
            const i = index;

            if (e.uniqueKey === uniqueKey) {
                //item, code, index, value
                baseline.setValue(item, type, i, value);
                break;
            }
        }
    };

    const handleRowDelete = uniqueKey => {
        for (let index = 0; index < baseline.data[type].length; index++) {
            const e = baseline.data[type][index];
            const i = index;

            if (e.uniqueKey === uniqueKey) {
                baseline.unSelectItem(type, i);
                break;
            }
        }
    };

    // Baseline has additional filtering criteria since Match and Baseline tabs both use the same store.
    // For Baseline - Show only codes which have
    const data =
        baseline &&
        baseline.data &&
        baseline.data[type] &&
        baseline.data[type].filter(code => {
            // return code.isSelected === true;

            return (
                // code.isSelected === true &&
                // code.enableMatchingBtn === false &&
                // Means, Do not show records from Multiple Records.
                code.matchingReq === false && code.fileType === fileType && code.incl === true
            );

            // TODO: Confirm if this is not necessary - // code.enableMatchingBtn === false &&
            // If Yes - Remove the below commented code block.
            // If No - Uncomment this and remove the above one.

            // return type === "ahd"
            //   ? code.isSelected === true &&
            //       // code.enableMatchingBtn === false &&
            //       code.matchingReq === false
            //   : code.isSelected === true && code.matchingReq === false;
        });

    let rows;
    if (data !== undefined) {
        rows = addSlNo(data);
    }

    const getType = (type, fileType) => {
        if (type === CLINICAL_CODELIST_GENERIC_LABEL && fileType === BASELINE_MEDS) {
            return CLINICAL_CODELIST_MEDICAL_LABEL;
        }

        if (type === CLINICAL_CODELIST_GENERIC_LABEL && fileType === BASELINE_DRUGS) {
            return CLINICAL_CODELIST_THERAPY_LABEL;
        }

        return AHD_BEAN_LIST_LABEL;
    };

    const getTableTitle = (type, fileType) => {
        if (type === CLINICAL_CODELIST_GENERIC_LABEL && fileType === BASELINE_MEDS) {
            return "Medical ";
        }

        if (type === CLINICAL_CODELIST_GENERIC_LABEL && fileType === BASELINE_DRUGS) {
            return "Drug ";
        }

        return "AHD ";
    };

    const codeIndex = fileType !== BASELINE_AHD ? buildCodeIndex(codes, fileType) : new Map();

    const handleApplyLatest = async (row, outOfSyncVariable) => {
        try {
            if (type === AHD_BEAN_LIST_LABEL) return;
            const payload = { ahd: [] };
            if (fileType === BASELINE_MEDS) {
                payload.read = [outOfSyncVariable];
                payload.drug = [];
            } else if (fileType === BASELINE_DRUGS) {
                payload.read = [];
                payload.drug = [outOfSyncVariable];
            } else {
                return;
            }
            const response = await codes.loadWithCodes(payload, studyDatabase.data?.id);
            const key =
                fileType === BASELINE_MEDS
                    ? CLINICAL_CODELIST_MEDICAL_LABEL
                    : CLINICAL_CODELIST_THERAPY_LABEL;
            const updatedList = response?.data?.[key] || [];
            const updated = updatedList?.find(i => i.id === outOfSyncVariable);
            if (!updated) {
                ShowError("Updated code not found in response");
            }

            // Update baseline store with latest code data
            for (let index = 0; index < baseline.data[type].length; index++) {
                const e = baseline.data[type][index];
                if (e.uniqueKey === row.uniqueKey) {
                    if (updated.filename !== undefined)
                        baseline.setValue("filename", type, index, updated.filename);
                    if (updated.codes !== undefined)
                        baseline.setValue("codes", type, index, updated.codes);
                    if (updated.label !== undefined)
                        baseline.setValue("label", type, index, updated.label);
                    if (updated.lastModifiedOn !== undefined)
                        baseline.setValue("lastModifiedOn", type, index, updated.lastModifiedOn);
                    if (updated.lastModifiedBy !== undefined)
                        baseline.setValue("lastModifiedBy", type, index, updated.lastModifiedBy);
                    if (updated.id !== undefined) baseline.setValue("id", type, index, updated.id);
                    break;
                }
            }

            // Update codes store to refresh the codeIndex with latest timestamps
            const codeType = fileType === BASELINE_MEDS ? "medical" : "drug";
            await codes.updateCodeList(outOfSyncVariable, codeType, {
                lastModifiedOn: updated.lastModifiedOn,
                lastModifiedBy: updated.lastModifiedBy,
                filename: updated.filename,
                codes: updated.codes,
                label: updated.label,
            });
            ShowSuccess(`Successfully synced "${row.filename}" to latest version`);
            return updated;
            // eslint-disable-next-line no-unused-vars
        } catch (ignored) {
            ShowError("Failed to apply latest code changes");
        }
    };

    return (
        <>
            {data && data.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Sl No</StyledTableCell>
                                <StyledTableCell>
                                    {getTableTitle(type, fileType)}
                                    Codes
                                </StyledTableCell>
                                <StyledTableCell>Type Of Record</StyledTableCell>
                                {![CROSS_SECTIONAL, INC_PREV].includes(studyDesign) && (
                                    <Tooltip title={baselineLeftMarginTooltip}>
                                        <StyledTableCell>
                                            {"Maximum duration before index date (left margin)"}{" "}
                                            <InfoIcon
                                                fontSize="small"
                                                sx={{ verticalAlign: "middle" }}
                                            />
                                        </StyledTableCell>
                                    </Tooltip>
                                )}
                                {![CROSS_SECTIONAL, INC_PREV].includes(studyDesign) && (
                                    <Tooltip title={baselineRightMarginTooltip}>
                                        <StyledTableCell>
                                            {"Add +/- time to Index Date (right margin)"}{" "}
                                            <InfoIcon
                                                fontSize="small"
                                                sx={{ verticalAlign: "middle" }}
                                            />
                                        </StyledTableCell>
                                    </Tooltip>
                                )}
                                <StyledTableCell>Action</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(row => {
                                // const getRowId = (row, type) => type === "clinicalCodeListTherapy" || type === CLINICAL_CODELIST_MEDICAL_LABEL ? row.filename : row.ahdCode;
                                // row._id is just a clear way to extract out the identifier.
                                // The way the current data works is, filename & ahdCode fields are considered as Unique Identifiers for each reads/meds.
                                row._id =
                                    type === CLINICAL_CODELIST_GENERIC_LABEL
                                        ? row.filename
                                        : row.ahdCode;
                                const modifiedOn = getCodeModifiedOn(row, codeIndex).modifiedOn;
                                const isVariableOutOfSync = isCodeOutOfSync(row, codeIndex, type);
                                return (
                                    <StyledTableRow key={row.uniqueKey}>
                                        <StyledTableCell component="th" scope="row">
                                            {row.slNo}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <GetCodes
                                                rowData={row}
                                                type={getType(type, fileType)}
                                            />

                                            {type !== AHD_BEAN_LIST_LABEL
                                                ? row.filename
                                                : row.label}
                                            {type !== AHD_BEAN_LIST_LABEL &&
                                                isVariableOutOfSync && (
                                                    <Tooltip
                                                        title={`Out of sync. Code modified on ${modifiedOn}; selected version on ${formatDateForTooltip(
                                                            getRowLastModifiedOn(row)
                                                        )}. Click to sync.`}
                                                        placement="right"
                                                    >
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                color="warning"
                                                                aria-label="apply-latest"
                                                                onClick={async () => {
                                                                    await handleApplyLatest(
                                                                        row,
                                                                        isVariableOutOfSync
                                                                    );
                                                                }}
                                                                sx={{
                                                                    verticalAlign: "middle",
                                                                    marginLeft: "6px",
                                                                    padding: "2px",
                                                                }}
                                                            >
                                                                <SyncProblemIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                )}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <>
                                                {[CROSS_SECTIONAL, INC_PREV].includes(
                                                    studyDesign
                                                ) ? (
                                                    <Tooltip
                                                        title={
                                                            "First event ever recorded regardless of index date. This event might have occurred outside the study period"
                                                        }
                                                    >
                                                        <span> {"First ever record"}</span>
                                                    </Tooltip>
                                                ) : (
                                                    <>
                                                        <FormControl>
                                                            <InputLabel id={`type${row._id}`}>
                                                                Type
                                                            </InputLabel>
                                                            <div>
                                                                <Select
                                                                    label="Type"
                                                                    labelId={`type${row._id}`}
                                                                    value={row.typeOfRecord}
                                                                    onChange={e => {
                                                                        handleSelectChange(
                                                                            "typeOfRecord",
                                                                            row,
                                                                            Number(e.target.value)
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        row.exposureType ===
                                                                            UNEDITABLE_FILE ||
                                                                        [
                                                                            CROSS_SECTIONAL,
                                                                            INC_PREV,
                                                                        ].includes(studyDesign)
                                                                    }
                                                                >
                                                                    {recordTypeOptions.map(
                                                                        recordType => (
                                                                            <MenuItem
                                                                                key={
                                                                                    recordType.value
                                                                                }
                                                                                value={
                                                                                    recordType.value
                                                                                }
                                                                            >
                                                                                <Tooltip
                                                                                    placement="right"
                                                                                    title={
                                                                                        recordType.tooltip
                                                                                    }
                                                                                    arrow
                                                                                >
                                                                                    <span>
                                                                                        {
                                                                                            recordType.label
                                                                                        }
                                                                                    </span>
                                                                                </Tooltip>
                                                                            </MenuItem>
                                                                        )
                                                                    )}
                                                                </Select>
                                                            </div>
                                                        </FormControl>
                                                    </>
                                                )}
                                            </>
                                        </StyledTableCell>
                                        {![CROSS_SECTIONAL, INC_PREV].includes(studyDesign) && (
                                            <Tooltip title={baselineLeftMarginTooltip}>
                                                <StyledTableCell>
                                                    {row.typeOfRecord !==
                                                        STUDY_BASELINE_RECORD_TYPES.FIRST_EVER && (
                                                        <NumberInput
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <NumberInputAdornment />
                                                                ),
                                                            }}
                                                            size="small"
                                                            name={
                                                                type +
                                                                fileType +
                                                                row.uniqueKey +
                                                                "beforeDays"
                                                            }
                                                            defaultValue={row.beforeDays}
                                                            onChange={e => {
                                                                handleInputChange(
                                                                    row.uniqueKey,
                                                                    "beforeDays",
                                                                    Number(e.target.value)
                                                                );
                                                            }}
                                                            min="-18263"
                                                            max={
                                                                row.beforeDays !== 0 &&
                                                                row.addSubDaysToIndex !== 0
                                                                    ? row.addSubDaysToIndex - 1
                                                                    : 0
                                                            }
                                                            disabled={
                                                                row.exposureType ===
                                                                    UNEDITABLE_FILE ||
                                                                row.typeOfRecord === 3
                                                            }
                                                        />
                                                    )}
                                                </StyledTableCell>
                                            </Tooltip>
                                        )}
                                        {![CROSS_SECTIONAL, INC_PREV].includes(studyDesign) && (
                                            <Tooltip title={baselineRightMarginTooltip}>
                                                <StyledTableCell>
                                                    {row.typeOfRecord !==
                                                        STUDY_BASELINE_RECORD_TYPES.FIRST_EVER && (
                                                        <NumberInput
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <NumberInputAdornment />
                                                                ),
                                                            }}
                                                            size="small"
                                                            name={
                                                                type +
                                                                fileType +
                                                                row.uniqueKey +
                                                                "addSubDaysToIndex"
                                                            }
                                                            defaultValue={row.addSubDaysToIndex}
                                                            onChange={e => {
                                                                handleInputChange(
                                                                    row.uniqueKey,
                                                                    "addSubDaysToIndex",
                                                                    Number(e.target.value)
                                                                );
                                                            }}
                                                            min="-18261"
                                                            max="18263"
                                                            disabled={
                                                                row.exposureType ===
                                                                    UNEDITABLE_FILE ||
                                                                row.typeOfRecord === 3
                                                            }
                                                        />
                                                    )}
                                                </StyledTableCell>
                                            </Tooltip>
                                        )}
                                        <StyledTableCell>
                                            <>
                                                {type === AHD_BEAN_LIST_LABEL ? (
                                                    <>
                                                        <FilterListIcon
                                                            aria-label="queryBuilder"
                                                            color="secondary"
                                                            onClick={() =>
                                                                handleBuildQueryModal(row)
                                                            }
                                                        />
                                                    </>
                                                ) : null}
                                                <DeleteOutlineOutlinedIcon
                                                    aria-label="delete"
                                                    color="secondary"
                                                    onClick={() => handleRowDelete(row.uniqueKey)}
                                                    // disabled={row.exposureType === UNEDITABLE_FILE}
                                                    style={{
                                                        display:
                                                            row.exposureType === UNEDITABLE_FILE
                                                                ? "none"
                                                                : "block",
                                                    }}
                                                ></DeleteOutlineOutlinedIcon>
                                            </>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : null}
            {type === AHD_BEAN_LIST_LABEL && open && <BuildQuery {...props} />}
        </>
    );
});

//#endregion

const AddCodesAndDisplayTables = observer(props => {
    const [readCodes, setReadCodes] = React.useState([]);
    const [drugCodes, setDrugCodes] = React.useState([]);
    const [ahdCodes, setAHDCodes] = React.useState([]);

    const { baseline, codes } = props;

    React.useEffect(() => {
        (() => {
            readCodes.forEach(input => {
                input.matchingReq = false;
                if ([CROSS_SECTIONAL, INC_PREV].includes(props.studyDesign)) {
                    input.typeOfRecord = 3;
                }
                baseline.addReadCode(input);
            });
        })();
    }, [readCodes, baseline]);

    React.useEffect(() => {
        (() => {
            drugCodes.forEach(input => {
                input.matchingReq = false;
                if ([CROSS_SECTIONAL, INC_PREV].includes(props.studyDesign)) {
                    input.typeOfRecord = 3;
                }
                baseline.addDrugCode(input);
            });
        })();
    }, [drugCodes, baseline]);

    React.useEffect(() => {
        (() => {
            ahdCodes.forEach(input => {
                input.matchingReq = false;
                if ([CROSS_SECTIONAL, INC_PREV].includes(props.studyDesign)) {
                    input.typeOfRecord = 3;
                }
                baseline.addAHDCode(input);
            });
        })();
    }, [ahdCodes, baseline]);

    const rest = {
        setReadCodes,
        setDrugCodes,
        setAHDCodes,
        readCodes,
        drugCodes,
        ahdCodes,
        store: baseline,
    };

    return (
        <>
            <div>
                <AddCodes codes={codes} tab="Baseline" {...rest} />
                <br />

                <CollectCodes
                    type={CLINICAL_CODELIST_GENERIC_LABEL}
                    fileType={BASELINE_DRUGS}
                    {...props}
                />
                <CollectCodes
                    type={CLINICAL_CODELIST_GENERIC_LABEL}
                    fileType={BASELINE_MEDS}
                    {...props}
                />
                <CollectCodes type={AHD_BEAN_LIST_LABEL} fileType={BASELINE_AHD} {...props} />
            </div>
        </>
    );
});

AddCodesAndDisplayTables.propTypes = {
    baseline: PropTypes.object.isRequired,
    codes: PropTypes.object.isRequired,
    studyDesign: PropTypes.string.isRequired,
};

//#region  - Main

export const Baseline = observer(props => {
    const { baseline, studyDesign } = props;

    const classes = useStyles();

    React.useEffect(() => {
        baseline.create();
    }, [baseline]);

    let defineBaselineVariables = STUDY_BASELINE_LOGIC;
    if (studyDesign === INC_PREV) {
        defineBaselineVariables = STUDY_BASELINE_LOGIC_FOR_INC_PREV;
    } else if (studyDesign === CASE_CONTROL) {
        defineBaselineVariables = STUDY_BASELINE_LOGIC_FOR_CASE_CONTROL;
    } else if (studyDesign === CROSS_SECTIONAL) {
        defineBaselineVariables = STUDY_BASELINE_LOGIC_FOR_CROSS_SECTIONAL;
    }

    return (
        <>
            <CssBaseline />
            <Paper className={classes.paper}>
                <CardHeader title={defineBaselineVariables} />
                <br />
                <AddCodesAndDisplayTables {...props} />
            </Paper>
        </>
    );
});

Baseline.propTypes = {
    baseline: PropTypes.object.isRequired,
    studyDesign: PropTypes.string.isRequired,
    codes: PropTypes.object.isRequired,
};

//#endregion
