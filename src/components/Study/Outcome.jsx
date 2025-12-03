import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Checkbox, FormControlLabel, FormLabel, Paper } from "@mui/material";
import { useStyles } from "../useStyles";
import CssBaseline from "@mui/material/CssBaseline";
import {
    AHD_BEAN_LIST_LABEL,
    CASE_CONTROL,
    CLINICAL_CODELIST_GENERIC_LABEL,
    CLINICAL_CODELIST_MEDICAL_LABEL,
    CLINICAL_CODELIST_THERAPY_LABEL,
    CROSS_SECTIONAL,
    INC_PREV,
    OUTCOME_AHD,
    OUTCOME_DRUGS,
    OUTCOME_MEDS,
    radioOptionsYesNo,
    STUDY_OUTCOME_CONSULTATIONS,
    STUDY_OUTCOME_PATIENT_CENSORED,
    UNEDITABLE_FILE,
} from "../../constants";

import { AddCodes } from "./AddCode";
import extractJsonObject from "./Parser";

import {
    BuildQuery,
    CardHeader,
    GetCodes,
    NumberInput,
    Radiogroup,
    ShowError,
    ShowSuccess,
    StyledTableCell,
    StyledTableRow,
} from "../Common";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import FilterListIcon from "@mui/icons-material/FilterList";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import IconButton from "@mui/material/IconButton";
import studyDatabase from "../../state/store/study/database";
import {
    addSlNo,
    buildCodeIndex,
    formatDateForTooltip,
    getCodeModifiedOn,
    getDescriptionFromADHCode,
    getRowLastModifiedOn,
    isCodeOutOfSync,
    prepareAHDCodes,
    stringToBoolean,
} from "../../utils";

import { observer } from "mobx-react";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Tooltip from "@mui/material/Tooltip";
import { NumberInputAdornment } from "../Common/NumberInputAdornment";
import DisplayComparisonResult, {
    getStudyWarningData,
} from "./StudyQuality/DisplayComparisonResult";

const CollectCodes = observer(({ outcome, type, fileType, mode, codes }) => {
    const classes = useStyles();

    const getIdentifier = type => (type === CLINICAL_CODELIST_GENERIC_LABEL ? "id" : "ahdCode");

    const [queryValue, setQueryValue] = React.useState({});
    const [open, setOpen] = React.useState(false);
    const [rowSelected, setRowSelected] = React.useState(false);

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

        if (outcome.data.ahdBeanList) {
            for (let index = 0; index < outcome.data.ahdBeanList.length; index++) {
                const e = outcome.data.ahdBeanList[index];
                if (e[identifier] === rowSelected._id) {
                    outcome.setValue("userQuery", AHD_BEAN_LIST_LABEL, index, sqlQuery);
                    break;
                }
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
        callback: handleQueryChange,
        description: getDescriptionFromADHCode(prepareAHDCodes(rowSelected).join() ?? ""),
    };

    const handleInputChange = (uniqueKey, item, value) => {
        if (outcome.data[type]) {
            for (let index = 0; index < outcome.data[type].length; index++) {
                const e = outcome.data[type][index];
                if (e.uniqueKey === uniqueKey) {
                    //item, code, index, value
                    outcome.setValue(item, type, index, value);
                    break;
                }
            }
        }
    };

    const handleCheckboxChange = (item, newRowData) => {
        for (let index = 0; index < outcome.data[type].length; index++) {
            const e = outcome.data[type][index];
            if (e.uniqueKey === newRowData.uniqueKey) {
                outcome.setValue(item, type, index, !e[item]);
                break;
            }
        }
    };

    const handleRowDelete = uniqueKey => {
        for (let index = 0; index < outcome.data[type].length; index++) {
            const e = outcome.data[type][index];
            if (e.uniqueKey === uniqueKey) {
                outcome.unSelectItem(type, index);
                break;
            }
        }

        // outcome.data[type].map((e, i) => {
        //   if (e.uniqueKey === uniqueKey) {
        //     outcome.unSelectItem(type, i);
        //   }
        // });
    };

    const data =
        outcome &&
        outcome.data &&
        outcome.data[type] &&
        outcome.data[type].filter(code => {
            // if (code.isSelected === true) return code;
            return code.fileType === fileType;
            // && code.isSelected === true
        });

    let rows;
    if (data !== undefined) {
        rows = addSlNo(data);
    }

    const getType = (type, fileType) => {
        if (type === CLINICAL_CODELIST_GENERIC_LABEL && fileType === OUTCOME_MEDS) {
            return CLINICAL_CODELIST_MEDICAL_LABEL;
        }

        if (type === CLINICAL_CODELIST_GENERIC_LABEL && fileType === OUTCOME_DRUGS) {
            return CLINICAL_CODELIST_THERAPY_LABEL;
        }
        return AHD_BEAN_LIST_LABEL;
    };

    const getTableTitle = (type, fileType) => {
        if (type === CLINICAL_CODELIST_GENERIC_LABEL && fileType === OUTCOME_MEDS) {
            return "Medical ";
        }

        if (type === CLINICAL_CODELIST_GENERIC_LABEL && fileType === OUTCOME_DRUGS) {
            return "Drug ";
        }

        return "AHD ";
    };

    // Build code index for sync detection
    const codeIndex = fileType !== OUTCOME_AHD ? buildCodeIndex(codes, fileType) : new Map();

    const handleApplyLatest = async (row, outOfSyncVariable) => {
        try {
            if (type === AHD_BEAN_LIST_LABEL) return;

            const payload = { ahd: [] };
            if (fileType === OUTCOME_MEDS) {
                payload.read = [outOfSyncVariable];
                payload.drug = [];
            } else if (fileType === OUTCOME_DRUGS) {
                payload.read = [];
                payload.drug = [outOfSyncVariable];
            } else {
                return;
            }

            const response = await codes.loadWithCodes(payload, studyDatabase.data?.id);
            const key =
                fileType === OUTCOME_MEDS
                    ? CLINICAL_CODELIST_MEDICAL_LABEL
                    : CLINICAL_CODELIST_THERAPY_LABEL;
            const updatedList = response?.data?.[key] || [];
            const updated = updatedList?.find(i => i.id === outOfSyncVariable);

            if (!updated) {
                ShowError("Updated code not found in response");
                return;
            }

            // Update outcome store with latest code data
            for (let index = 0; index < outcome.data[type].length; index++) {
                const e = outcome.data[type][index];
                if (e.uniqueKey === row.uniqueKey) {
                    if (updated.filename !== undefined)
                        outcome.setValue("filename", type, index, updated.filename);
                    if (updated.codes !== undefined)
                        outcome.setValue("codes", type, index, updated.codes);
                    if (updated.label !== undefined)
                        outcome.setValue("label", type, index, updated.label);
                    if (updated.lastModifiedOn !== undefined)
                        outcome.setValue("lastModifiedOn", type, index, updated.lastModifiedOn);
                    if (updated.lastModifiedBy !== undefined)
                        outcome.setValue("lastModifiedBy", type, index, updated.lastModifiedBy);
                    if (updated.id !== undefined) outcome.setValue("id", type, index, updated.id);
                    break;
                }
            }

            // Update codes store
            const codeType = fileType === OUTCOME_MEDS ? "medical" : "drug";
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

                                <Tooltip
                                    aria-label={"Count the number of events till the study end"}
                                    title={"Count the number of events till the study end"}
                                >
                                    <StyledTableCell>Event counts</StyledTableCell>
                                </Tooltip>

                                <Tooltip
                                    aria-label={
                                        "Count the number of consultations before this event"
                                    }
                                    title={"Count the number of consultations before this event"}
                                >
                                    <StyledTableCell>Consultation counts</StyledTableCell>
                                </Tooltip>
                                <StyledTableCell>
                                    Exclude participants if outcome appears before Index Date
                                </StyledTableCell>
                                <Tooltip
                                    title={
                                        "Determine outcome within a specific timeframe post-index date. ZERO implies no time limit."
                                    }
                                >
                                    <StyledTableCell>
                                        Observe outcome within a certain duration
                                    </StyledTableCell>
                                </Tooltip>
                                <StyledTableCell>Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(row => {
                                // const getRowId = (row, type) => type === "clinicalCodeListTherapy" || type === "clinicalCodeListMedical" ? row.filename : row.ahdCode;
                                // row._id is just a clear way to extract out the identifier.
                                // The way the current data works is, filename & ahdCode fields are considered as Unique Identifiers for each reads/meds.
                                row._id =
                                    type === CLINICAL_CODELIST_GENERIC_LABEL
                                        ? row.filename
                                        : row.ahdCode;

                                return (
                                    <StyledTableRow key={row.slNo}>
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

                                        <StyledTableCell>
                                            <FormControlLabel
                                                size="small"
                                                //label={"eventCounts"}
                                                control={
                                                    <Checkbox
                                                        checked={row.eventCounts}
                                                        onChange={() => {
                                                            handleCheckboxChange(
                                                                "eventCounts",
                                                                row
                                                            );
                                                        }}
                                                        disabled={
                                                            row.exposureType === UNEDITABLE_FILE
                                                        }
                                                    />
                                                }
                                            />
                                        </StyledTableCell>

                                        <StyledTableCell>
                                            <FormControlLabel
                                                size="small"
                                                //label={"consultCounts"}
                                                control={
                                                    <Checkbox
                                                        checked={row.consultCounts}
                                                        onChange={() => {
                                                            handleCheckboxChange(
                                                                "consultCounts",
                                                                row
                                                            );
                                                        }}
                                                        disabled={
                                                            row.exposureType === UNEDITABLE_FILE
                                                        }
                                                    />
                                                }
                                            />
                                        </StyledTableCell>

                                        <StyledTableCell>
                                            <FormControlLabel
                                                size="small"
                                                //label={"ExcludeBeforeIndex"}
                                                control={
                                                    <Checkbox
                                                        checked={row.excluIfOcBefIn}
                                                        onChange={() => {
                                                            handleCheckboxChange(
                                                                "excluIfOcBefIn",
                                                                row
                                                            );
                                                        }}
                                                        disabled={
                                                            row.exposureType === UNEDITABLE_FILE ||
                                                            mode === "modify"
                                                        }
                                                    />
                                                }
                                            />
                                        </StyledTableCell>

                                        <StyledTableCell>
                                            <Tooltip
                                                title={
                                                    "Find outcome within specified duration after index date. ZERO = no time limit."
                                                }
                                            >
                                                <NumberInput
                                                    size="small"
                                                    name={
                                                        type +
                                                        fileType +
                                                        row.uniqueKey +
                                                        "beforeDays"
                                                    }
                                                    InputProps={{
                                                        endAdornment: <NumberInputAdornment />,
                                                    }}
                                                    defaultValue={row.beforeDays}
                                                    onChange={e => {
                                                        handleInputChange(
                                                            row.uniqueKey,
                                                            "beforeDays",
                                                            Number(e.target.value)
                                                        );
                                                    }}
                                                    min="0"
                                                    max="36526"
                                                    disabled={
                                                        row.exposureType === UNEDITABLE_FILE ||
                                                        row.typeOfRecord === 3
                                                    }
                                                />
                                            </Tooltip>
                                        </StyledTableCell>

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
                                                            style={{
                                                                display:
                                                                    row.exposureType ===
                                                                    UNEDITABLE_FILE
                                                                        ? "none"
                                                                        : "block",
                                                            }}
                                                        ></FilterListIcon>
                                                    </>
                                                ) : null}

                                                <DeleteOutlineOutlinedIcon
                                                    aria-label="delete"
                                                    color="secondary"
                                                    onClick={() => handleRowDelete(row.uniqueKey)}
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

CollectCodes.propTypes = {
    outcome: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    codes: PropTypes.object.isRequired,
};

export const ConsultationBetweenIndexAndEntry = observer(props => {
    const { outcome } = props;
    const { countConsult } = outcome.data;

    return (
        <>
            <CardHeader title="Consultation between Index date and Exit date" />
            <div style={{ marginLeft: "10px", width: "50%" }}>
                <br />
                <FormLabel component="legend">{STUDY_OUTCOME_CONSULTATIONS}</FormLabel>
                <Radiogroup
                    name="radioYesNo"
                    value={countConsult === undefined ? false : countConsult}
                    handleChange={e => outcome.set("countConsult", stringToBoolean(e.target.value))}
                    radioOptions={radioOptionsYesNo}
                />
            </div>
        </>
    );
});

const AddCodesAndDisplayTables = observer(props => {
    const { outcome, codes, mode } = props;

    const [drugCodes, setDrugCodes] = React.useState([]);
    const [readCodes, setReadCodes] = React.useState([]);
    const [ahdCodes, setAHDCodes] = React.useState([]);

    React.useEffect(() => {
        (() => {
            readCodes.forEach(input => {
                outcome.addReadCode(input);
            });
        })();
    }, [readCodes, outcome]);

    React.useEffect(() => {
        (() => {
            drugCodes.forEach(input => {
                outcome.addDrugCode(input);
            });
        })();
    }, [drugCodes, outcome]);

    React.useEffect(() => {
        (() => {
            ahdCodes.forEach(input => {
                outcome.addAHDCode(input);
            });
        })();
    }, [ahdCodes, outcome]);

    const rest = {
        setReadCodes,
        setDrugCodes,
        setAHDCodes,
        readCodes,
        drugCodes,
        ahdCodes,
        store: outcome,
    };

    return (
        <>
            <div>
                <CardHeader title={STUDY_OUTCOME_PATIENT_CENSORED} />
                <br />
                <AddCodes codes={codes} tab="Outcome" {...rest} />
                <br />
                <CollectCodes
                    outcome={outcome}
                    type={CLINICAL_CODELIST_GENERIC_LABEL}
                    fileType={OUTCOME_DRUGS}
                    mode={mode}
                    {...props}
                />
                <CollectCodes
                    outcome={outcome}
                    type={CLINICAL_CODELIST_GENERIC_LABEL}
                    fileType={OUTCOME_MEDS}
                    mode={mode}
                    {...props}
                />
                <CollectCodes
                    outcome={outcome}
                    type={AHD_BEAN_LIST_LABEL}
                    fileType={OUTCOME_AHD}
                    mode={mode}
                    {...props}
                />
            </div>
        </>
    );
});

export const Outcome = observer(props => {
    const classes = useStyles();
    const { outcome } = props;

    React.useEffect(() => {
        (async () => {
            if (outcome.dirty === false) {
                await outcome.create();
            }
        })();
    }, [outcome]);

    const [comparisonResults, setComparisonResult] = React.useState(getStudyWarningData());

    useEffect(() => {
        setComparisonResult(getStudyWarningData());
    }, [outcome.data?.clinicalCodeList?.length, outcome.data?.ahdBeanList?.length]);

    React.useEffect(() => {
        outcome.create();
    }, [outcome]);

    return (
        <>
            <CssBaseline />
            {![CROSS_SECTIONAL, INC_PREV].includes(props.studyDesign) && (
                <div>
                    <DisplayComparisonResult comparisonResults={comparisonResults} />

                    <Paper className={classes.paper}>
                        <ConsultationBetweenIndexAndEntry {...props} />
                    </Paper>
                    <br />
                    {props.studyDesign !== CASE_CONTROL && (
                        <Paper className={classes.paper}>
                            <AddCodesAndDisplayTables {...props} />
                        </Paper>
                    )}
                    <br />
                </div>
            )}
        </>
    );
});
