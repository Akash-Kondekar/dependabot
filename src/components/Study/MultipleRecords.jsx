//#region - Imports
import React from "react";
import PropTypes from "prop-types";
import { Paper } from "@mui/material";
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
import {
    AHD_BEAN_LIST_LABEL,
    BASELINE_AHD,
    BASELINE_DRUGS,
    BASELINE_MEDS,
    CLINICAL_CODELIST_GENERIC_LABEL,
    CLINICAL_CODELIST_MEDICAL_LABEL,
    CLINICAL_CODELIST_THERAPY_LABEL,
    CONSULTATIONS,
    LENGTH,
    MR_RECORDS,
    MR_TITLE,
    radioOptionsMRYesNo,
    TIMESERIES,
    TYPE_OF_CONS_RECORD,
    TYPE_OF_RECORD,
    UNEDITABLE_FILE,
} from "../../constants";

import { AddCodes } from "./AddCode";
import {
    BuildQuery,
    CardHeader,
    Dropdown,
    GetCodes,
    NumberInput,
    Radiogroup,
    Row,
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
    getDefaultMRvalue,
    getDescriptionFromADHCode,
    getRowLastModifiedOn,
    isCodeOutOfSync,
    prepareAHDCodes,
    stringToBoolean,
} from "../../utils";

import FilterListIcon from "@mui/icons-material/FilterList";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import studyDatabase from "../../state/store/study/database";
import { NumberInputAdornment } from "../Common/NumberInputAdornment";

//#endregion

//#region - One

const CollectCodes = observer(({ baseline, type, fileType, codes }) => {
    const classes = useStyles();

    const [queryValue, setQueryValue] = React.useState({});
    const [open, setOpen] = React.useState(false);
    const [rowSelected, setRowSelected] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const getIdentifier = type => (type === CLINICAL_CODELIST_GENERIC_LABEL ? "id" : "ahdCode");

    // const handleBuildQueryModal = (row) => {
    //   setRowSelected(row);
    //   setOpen(true);
    // };

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
                rowSelected.incl === false &&
                rowSelected.matchingReq === false &&
                rowSelected.fileType === fileType &&
                rowSelected.exposureType !== UNEDITABLE_FILE &&
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

    const handleRadioChange = (item, newRowData, value) => {
        for (let index = 0; index < baseline.data[type].length; index++) {
            const e = baseline.data[type][index];
            const i = index;

            if (e.uniqueKey === newRowData.uniqueKey) {
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

    // const data =
    //   records &&
    //   records.data &&
    //   records.data[type] &&
    //   records.data[type].filter((ahd) => {
    //     return ahd.isSelected === true;
    //   });

    // const data = baseline.data[type];
    const data = baseline.data[type].filter(
        code =>
            code.incl === false && // Means, Specifically codes added for Multiple Records.
            code.matchingReq === false &&
            code.fileType === fileType &&
            code.exposureType !== UNEDITABLE_FILE // Old Codes if any, Do not show.
    );

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

    const { needTimeSeries } = baseline.data;

    // Build code index for sync detection
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
                return;
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

            // Update codes store
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
        } catch (_ignored) {
            ShowError("Failed to apply latest code changes");
        }
    };

    return (
        <>
            {data && data.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Sl No</StyledTableCell>
                                <StyledTableCell>
                                    {getTableTitle(type, fileType)}
                                    Codes
                                </StyledTableCell>
                                {needTimeSeries === false && (
                                    <StyledTableCell>Type Of Record Required</StyledTableCell>
                                )}
                                <StyledTableCell>Action</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(row => {
                                row._id =
                                    type === CLINICAL_CODELIST_GENERIC_LABEL
                                        ? row.filename
                                        : row.ahdCode;

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
                                                (() => {
                                                    const isVariableOutOfSync = isCodeOutOfSync(
                                                        row,
                                                        codeIndex,
                                                        type
                                                    );
                                                    if (isVariableOutOfSync) {
                                                        const modifiedOn = getCodeModifiedOn(
                                                            row,
                                                            codeIndex
                                                        ).modifiedOn;
                                                        return (
                                                            <Tooltip
                                                                title={`Out of sync. Code modified on ${formatDateForTooltip(modifiedOn)}; selected version on ${formatDateForTooltip(getRowLastModifiedOn(row))}. Click to sync.`}
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
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                        </StyledTableCell>

                                        {needTimeSeries === false && (
                                            <StyledTableCell>
                                                <>
                                                    <Dropdown
                                                        formControlClassName={`${row.matchWith}${row.uniqueKey}${type}`}
                                                        labelName={TYPE_OF_RECORD}
                                                        labelValue={TYPE_OF_RECORD}
                                                        ddLabel={TYPE_OF_RECORD}
                                                        value={
                                                            row.matchWith === undefined
                                                                ? getDefaultMRvalue
                                                                : row.matchWith
                                                        }
                                                        handleChange={e =>
                                                            handleRadioChange(
                                                                "matchWith",
                                                                row,
                                                                e.target.value
                                                            )
                                                        }
                                                        dropdownOptions={MR_RECORDS}
                                                    />
                                                </>
                                            </StyledTableCell>
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
                                                        ></FilterListIcon>
                                                        {/* {row.query.sqlQuery && (
                              <Tooltip title={row.query.sqlQuery ?? ""}>
                                <InfoIcon
                                  aria-label="query"
                                  color="secondary"
                                ></InfoIcon>
                              </Tooltip>
                            )} */}
                                                    </>
                                                ) : null}
                                                <DeleteOutlineOutlinedIcon
                                                    aria-label="delete"
                                                    color="secondary"
                                                    onClick={() => handleRowDelete(row.uniqueKey)}
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

CollectCodes.propTypes = {
    baseline: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    codes: PropTypes.object.isRequired,
};

//#endregion

const AddCodesAndDisplayTables = observer(props => {
    const [readCodes, setReadCodes] = React.useState([]);
    const [drugCodes, setDrugCodes] = React.useState([]);
    const [ahdCodes, setAHDCodes] = React.useState([]);

    const { baseline, codes } = props;

    React.useEffect(() => {
        (async () => {
            readCodes.forEach(input => {
                input.incl = false;
                baseline.addReadCode(input);
            });
        })();
    }, [readCodes, baseline]);

    React.useEffect(() => {
        (async () => {
            drugCodes.forEach(input => {
                input.incl = false;
                baseline.addDrugCode(input);
            });
        })();
    }, [drugCodes, baseline]);

    React.useEffect(() => {
        (async () => {
            ahdCodes.forEach(input => {
                input.incl = false;
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
                <AddCodes codes={codes} tab="Records" {...rest} />
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

//#region  - Main

export const ConsultationInfo = observer(props => {
    const { baseline } = props;
    const classes = useStyles();

    const { needConsultRecords, consultTypeReq, needTimeSeries, timeSeriesLength } = baseline.data;

    return (
        <>
            <div>
                <br />
                <Paper className={classes.paper}>
                    <Row label={CONSULTATIONS}>
                        <Radiogroup
                            name="radioYesNo"
                            value={needConsultRecords === undefined ? false : needConsultRecords}
                            handleChange={e =>
                                baseline.set("needConsultRecords", stringToBoolean(e.target.value))
                            }
                            radioOptions={radioOptionsMRYesNo}
                        />
                    </Row>

                    {needConsultRecords === true && (
                        <>
                            <br />
                            <Dropdown
                                formControlClassName="dropdownConsultationMultipleRecords"
                                labelName={TYPE_OF_CONS_RECORD}
                                labelValue={TYPE_OF_CONS_RECORD}
                                ddLabel={TYPE_OF_CONS_RECORD}
                                value={
                                    consultTypeReq === undefined
                                        ? getDefaultMRvalue
                                        : consultTypeReq
                                }
                                handleChange={e => baseline.set("consultTypeReq", e.target.value)}
                                dropdownOptions={MR_RECORDS}
                            />
                            <br />
                        </>
                    )}
                </Paper>
                <br />
                <Paper className={classes.paper}>
                    <Row label={TIMESERIES}>
                        <Radiogroup
                            name="radioYesNo_3"
                            value={needTimeSeries === undefined ? false : needTimeSeries}
                            handleChange={e =>
                                baseline.set("needTimeSeries", stringToBoolean(e.target.value))
                            }
                            radioOptions={radioOptionsMRYesNo}
                        />
                    </Row>
                    {needTimeSeries === true ? (
                        // Number Input
                        <Row label={LENGTH}>
                            <NumberInput
                                InputProps={{ endAdornment: <NumberInputAdornment /> }}
                                size="small"
                                name="timeSeriesLength"
                                defaultValue={timeSeriesLength}
                                onChange={e => {
                                    baseline.set("timeSeriesLength", Number(e.target.value));
                                }}
                                min="0"
                                max="365"
                            />
                        </Row>
                    ) : null}
                </Paper>
            </div>
        </>
    );
});

export const MultipleRecords = observer(props => {
    const { baseline } = props;
    const classes = useStyles();

    React.useEffect(() => {
        baseline.create();
    }, [baseline]);

    return (
        <>
            <CssBaseline />
            <Paper className={classes.paper}>
                <CardHeader title={MR_TITLE} />
                <ConsultationInfo {...props} />
                <br />
                <AddCodesAndDisplayTables {...props} />
            </Paper>
        </>
    );
});

//#endregion
