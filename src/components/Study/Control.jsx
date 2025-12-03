//#region - Imports

import React from "react";
import PropTypes from "prop-types";

import { FormControl, FormLabel, InputLabel, Paper, Select, Tooltip } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { useStyles } from "../useStyles";
import CssBaseline from "@mui/material/CssBaseline";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { observer } from "mobx-react";

import { AddCodes } from "./AddCode";
import {
    BuildQuery,
    CardHeader,
    ExclusionTypes,
    GetCodes,
    InclusionTypes,
    NumberInput,
    Radiogroup,
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
    stringToBoolean,
} from "../../utils";

import Combination from "./Combination";
import extractJsonObject from "./Parser";
import {
    AHD_BEAN_LIST_LABEL,
    CASE_CONTROL,
    CLINICAL_CODELIST_MEDICAL_LABEL,
    CLINICAL_CODELIST_THERAPY_LABEL,
    CONTROL_DRUGS,
    CONTROL_MEDS,
    radioOptionsControlIndexDate,
    radioOptionsControlIndexDateForCaseControl,
    radioOptionsControlYesNo,
    SAME_AS_EXPOSED_INDEX,
    SAME_AS_EXPOSED_INDEX_FOR_CASE_CONTROL,
    STUDY_NEED_UNEXPOSED,
    STUDY_NEED_UNEXPOSED_FOR_CASE_CONTROL,
} from "../../constants";

import FilterListIcon from "@mui/icons-material/FilterList";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import IconButton from "@mui/material/IconButton";
import studyDatabase from "../../state/store/study/database";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { NumberInputAdornment } from "../Common/NumberInputAdornment";
import { ShowWarning } from "../../componentsV2/Common/Toast";

const AddCodesAndDisplayTables = observer(props => {
    const [readCodes, setReadCodes] = React.useState([]);
    const [drugCodes, setDrugCodes] = React.useState([]);
    const [ahdCodes, setAHDCodes] = React.useState([]);

    const { unexposed, codes, mode } = props;

    React.useEffect(() => {
        (async () => {
            let filterData = readCodes.filter(
                code =>
                    !unexposed.data.clinicalCodeListMedical.find(
                        e => code.filename === e.filename
                        //(e) => code.id === e.id
                    )
            );

            filterData.forEach(input => {
                unexposed.addReadCode(input);
            });

            filterData = drugCodes.filter(
                code =>
                    !unexposed.data.clinicalCodeListTherapy.find(
                        e => code.filename === e.filename
                        //(e) => code.id === e.id
                    )
            );
            filterData.forEach(input => {
                unexposed.addDrugCode(input);
            });

            filterData = ahdCodes.filter(
                code => !unexposed.data.ahdBeanList.find(e => code.ahdCode === e.ahdCode)
            );

            filterData.forEach(input => {
                unexposed.addAHDCode(input);
            });
        })();
    }, [readCodes, drugCodes, ahdCodes, unexposed]);

    const rest = {
        setReadCodes,
        setDrugCodes,
        setAHDCodes,
        readCodes,
        drugCodes,
        ahdCodes,
        store: unexposed,
        mode,
    };

    return (
        <>
            <div>
                <AddCodes codes={codes} tab="Unexposed" {...rest} />
                <br />
                <CollectCodes type={CLINICAL_CODELIST_THERAPY_LABEL} {...props} />
                <CollectCodes type={CLINICAL_CODELIST_MEDICAL_LABEL} {...props} />
                <CollectCodes type={AHD_BEAN_LIST_LABEL} {...props} />
            </div>
        </>
    );
});

const getMatchCode = expose => {
    const { includedAHDs, includedDrugs, includedReads } = expose.getIncludedCodes();

    let matchWithCodes = [];

    const defaultSelect = { value: "none", label: "Select One" };
    matchWithCodes.push(defaultSelect);
    let ahdList = includedAHDs.map(value => {
        // return { value: value._id + value.label, label: value.label };
        return { value: value.label, label: value.label };
    });
    let readList = includedReads.map(value => {
        // return { value: value._id + value.filename, label: value.filename };
        return { value: value.filename, label: value.filename };
    });
    let drugList = includedDrugs.map(value => {
        // return { value: value._id + value.filename, label: value.filename };
        return { value: value.filename, label: value.filename };
    });
    matchWithCodes.push(...ahdList, ...readList, ...drugList);
    return matchWithCodes;
};

//#region  - One Table

const CollectCodes = observer(({ unexposed, expose, type, mode, codes }) => {
    const classes = useStyles();
    const matchWithCodes = getMatchCode(expose);

    const [queryValue, setQueryValue] = React.useState({});
    const [open, setOpen] = React.useState(false);
    const [rowSelected, setRowSelected] = React.useState(false);

    const getIdentifier = type =>
        type === CLINICAL_CODELIST_THERAPY_LABEL || type === CLINICAL_CODELIST_MEDICAL_LABEL
            ? "filename"
            : //? "id"
              "ahdCode";

    const getCodeName = type =>
        type === CLINICAL_CODELIST_THERAPY_LABEL || type === CLINICAL_CODELIST_MEDICAL_LABEL
            ? "filename"
            : "label";

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

        for (let index = 0; index < unexposed.data.ahdBeanList.length; index++) {
            const e = unexposed.data.ahdBeanList[index];
            const i = index;

            if (e[identifier] === rowSelected._id) {
                unexposed.setValue("userQuery", AHD_BEAN_LIST_LABEL, i, sqlQuery);
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
        callback: handleQueryChange,
        description: getDescriptionFromADHCode(prepareAHDCodes(rowSelected).join() ?? ""),
    };

    const handleRadioChange = (newRowData, value) => {
        const identifier = getIdentifier(type);

        const valueToExclude = newRowData[getCodeName(type)];
        if (value === false) {
            if (unexposed.data?.finalExclusion?.length !== 1) {
                // Trying to Exclude
                // Check if value is present in inclusion string.
                if (unexposed.data.exclusion.indexOf(valueToExclude) !== -1) {
                    ShowWarning(
                        "Cannot Exclude. Please remove this variable from the combination and try again."
                    );
                    return;
                }
            } else {
                const label = getCodeName(type);
                unexposed.updateFinalExclusion(newRowData[label], value); // This could be the reason for  additions of deleted codes.
            }
        }

        for (let index = 0; index < unexposed.data[type].length; index++) {
            const e = unexposed.data[type][index];
            const i = index;

            if (e[identifier] === newRowData._id) {
                unexposed.setInclude(type, i, value);
                const label = getCodeName(type);
                unexposed.updateFinalExclusion(newRowData[label], value);
                break;
            }
        }
        if (unexposed.data?.finalExclusion?.length === 0) {
            unexposed.set("exclusion", "");
        }
    };

    const handleInputChange = (_id, item, value) => {
        const identifier = getIdentifier(type);

        for (let index = 0; index < unexposed.data[type].length; index++) {
            const e = unexposed.data[type][index];
            const i = index;

            if (e[identifier] === _id) {
                //item, code, index, value
                unexposed.setValue(item, type, i, value);
                break;
            }
        }
    };

    const handleDropDownUpdate = (newRowData, value, incl) => {
        const identifier = getIdentifier(type);

        for (let index = 0; index < unexposed.data[type].length; index++) {
            const e = unexposed.data[type][index];
            const i = index;

            if (e[identifier] === newRowData._id) {
                if (incl) {
                    unexposed.setExposureType(type, i, value);
                } else {
                    unexposed.setTypeOfRecord(type, i, value);
                }
                break;
            }
        }
    };

    const handleMatchPropertyUpdate = (newRowData, value) => {
        const identifier = getIdentifier(type);
        for (let index = 0; index < unexposed.data[type].length; index++) {
            const e = unexposed.data[type][index];
            const i = index;

            if (e[identifier] === newRowData._id) {
                unexposed.setMatchWithProperty(type, i, value);
                break;
            }
        }
    };

    const handleRowDelete = (_id, row) => {
        const valueToDelete = row[getCodeName(type)];
        if (unexposed.data?.finalExclusion?.length !== 1) {
            if (unexposed.data?.exclusion?.indexOf(valueToDelete) !== -1) {
                ShowWarning("To Delete please remove this variable from the combination ");
                return;
            }
        }

        // Check it is the value in present in finalExclusion Array. If Yes, Remove it.
        unexposed.updateFinalExclusion(valueToDelete, false); // false means exclude or remove from FinalExclusion array.

        const identifier = getIdentifier(type);

        for (let index = 0; index < unexposed.data[type].length; index++) {
            const e = unexposed.data[type][index];
            const i = index;

            if (e[identifier] === _id) {
                unexposed.unSelectItem(type, i);
                break;
            }
        }
        if (unexposed.data?.finalExclusion?.length === 0) {
            unexposed.set("exclusion", "");
        }
    };

    // const data = unexposed.data[type].filter((read) => {
    //   return read.isSelected === true;
    // });

    const data = unexposed.data[type];

    const rows = addSlNo(data);
    const modifyMode = mode === "modify";

    // Build code index for sync detection
    const getFileTypeForIndex = () => {
        if (type === CLINICAL_CODELIST_MEDICAL_LABEL) return CONTROL_MEDS;
        if (type === CLINICAL_CODELIST_THERAPY_LABEL) return CONTROL_DRUGS;
        return null;
    };
    const fileTypeForIndex = getFileTypeForIndex();
    const codeIndex = fileTypeForIndex ? buildCodeIndex(codes, fileTypeForIndex) : new Map();

    const handleApplyLatest = async (row, outOfSyncVariable) => {
        try {
            if (type === AHD_BEAN_LIST_LABEL) return;

            const payload = { ahd: [] };
            if (type === CLINICAL_CODELIST_MEDICAL_LABEL) {
                payload.read = [outOfSyncVariable];
                payload.drug = [];
            } else if (type === CLINICAL_CODELIST_THERAPY_LABEL) {
                payload.read = [];
                payload.drug = [outOfSyncVariable];
            } else {
                return;
            }

            const response = await codes.loadWithCodes(payload, studyDatabase.data?.id);
            const key =
                type === CLINICAL_CODELIST_MEDICAL_LABEL
                    ? CLINICAL_CODELIST_MEDICAL_LABEL
                    : CLINICAL_CODELIST_THERAPY_LABEL;
            const updatedList = response?.data?.[key] || [];
            const updated = updatedList?.find(i => i.id === outOfSyncVariable);

            if (!updated) {
                ShowError("Updated code not found in response");
                return;
            }

            // Update unexposed store with latest code data
            const identifier = getIdentifier(type);
            for (let index = 0; index < unexposed.data[type].length; index++) {
                const e = unexposed.data[type][index];
                if (e[identifier] === row._id) {
                    if (updated.filename !== undefined)
                        unexposed.setValue("filename", type, index, updated.filename);
                    if (updated.codes !== undefined)
                        unexposed.setValue("codes", type, index, updated.codes);
                    if (updated.label !== undefined)
                        unexposed.setValue("label", type, index, updated.label);
                    if (updated.lastModifiedOn !== undefined)
                        unexposed.setValue("lastModifiedOn", type, index, updated.lastModifiedOn);
                    if (updated.lastModifiedBy !== undefined)
                        unexposed.setValue("lastModifiedBy", type, index, updated.lastModifiedBy);
                    if (updated.id !== undefined) unexposed.setValue("id", type, index, updated.id);
                    break;
                }
            }

            // Update codes store
            const codeType = type === CLINICAL_CODELIST_MEDICAL_LABEL ? "medical" : "drug";
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
            {data.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell style={{ width: "2%" }}>Sl No</StyledTableCell>
                                <StyledTableCell style={{ width: "20%" }}>
                                    {type === CLINICAL_CODELIST_MEDICAL_LABEL
                                        ? "Medical "
                                        : type === CLINICAL_CODELIST_THERAPY_LABEL
                                          ? "Drug "
                                          : "AHD "}
                                    Codes
                                </StyledTableCell>
                                <StyledTableCell style={{ width: "3%" }}>Criteria</StyledTableCell>
                                <StyledTableCell style={{ width: "20%" }}>Type</StyledTableCell>

                                <StyledTableCell style={{ width: "20%" }}>Options</StyledTableCell>

                                {/* <StyledTableCell style={{ width: "10%" }}>
                  Number of Time Frames
                </StyledTableCell> */}
                                <StyledTableCell style={{ width: "14%" }}>
                                    Match Property With
                                </StyledTableCell>
                                <StyledTableCell style={{ width: "8%" }}>
                                    Days Before Exposure
                                </StyledTableCell>
                                <StyledTableCell style={{ width: "8%" }}>
                                    Days After Exposure
                                </StyledTableCell>
                                <StyledTableCell style={{ width: "3%" }}>Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(row => {
                                // const getRowId = (row, type) => type === "clinicalCodeListTherapy" || type === "clinicalCodeListMedical" ? row.filename : row.ahdCode;
                                // row._id is just a clear way to extract out the identifier.
                                // The way the current data works is, filename & ahdCode fields are considered as Unique Identifiers for each reads/meds.
                                row._id =
                                    type === CLINICAL_CODELIST_THERAPY_LABEL ||
                                    type === CLINICAL_CODELIST_MEDICAL_LABEL
                                        ? row.filename
                                        : //? row.id
                                          row.ahdCode;

                                return (
                                    <StyledTableRow key={row._id + type}>
                                        <StyledTableCell component="th" scope="row">
                                            {row.slNo}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <GetCodes rowData={row} type={type} />
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
                                            <>
                                                <FormControl
                                                    className={classes.formControl}
                                                    size="small"
                                                >
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                color="secondary"
                                                                checked={row.incl}
                                                                disabled={modifyMode}
                                                                onChange={() => {
                                                                    handleRadioChange(
                                                                        row,
                                                                        !row.incl
                                                                    );
                                                                }}
                                                                name={
                                                                    "radio-button-included" +
                                                                    row.readCode
                                                                }
                                                                slotProps={{
                                                                    input: row.incl
                                                                        ? {
                                                                              "aria-label":
                                                                                  "Included",
                                                                          }
                                                                        : {
                                                                              "aria-label":
                                                                                  "Excluded",
                                                                          },
                                                                }}
                                                            />
                                                        }
                                                        label={row.incl ? "Include" : "Exclude"}
                                                    />
                                                </FormControl>
                                            </>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {/* 
                      // TODO - The below React Fragment may not be needed anymore */}
                                            <>
                                                <FormControl
                                                    className={classes.formControl}
                                                    size="small"
                                                >
                                                    <InputLabel htmlFor="age-native-simple">
                                                        Type
                                                    </InputLabel>
                                                    <Select
                                                        native
                                                        value={
                                                            row.incl === true
                                                                ? row.exposureType
                                                                : row.typeOfRecord
                                                        }
                                                        onChange={e => {
                                                            handleDropDownUpdate(
                                                                row,
                                                                Number(e.target.value),
                                                                row.incl
                                                            );
                                                        }}
                                                        label="Type"
                                                        inputProps={{
                                                            name: `exposureType${type}{row._id}{row.exposureType}`,
                                                            id: `exposureType${type}{row._id}{row.exposureType}`,
                                                            disabled: modifyMode,
                                                        }}
                                                    >
                                                        {row.incl === true ? (
                                                            <InclusionTypes
                                                                mode={modifyMode}
                                                                tab="Unexposed"
                                                            />
                                                        ) : (
                                                            <ExclusionTypes mode={modifyMode} />
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </>
                                        </StyledTableCell>

                                        <StyledTableCell>
                                            {row.incl === true &&
                                            type === CLINICAL_CODELIST_THERAPY_LABEL ? (
                                                <>
                                                    <Tooltip
                                                        title="Enter the amount of time that define one window during which at least one
   prescription should be recorded for the medication"
                                                    >
                                                        <NumberInput
                                                            size="small"
                                                            key={row.slNo}
                                                            name={type + row._id + "years"}
                                                            defaultValue={row.years}
                                                            onChange={e =>
                                                                handleInputChange(
                                                                    row._id,
                                                                    "years",
                                                                    Number(e.target.value)
                                                                )
                                                            }
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <NumberInputAdornment />
                                                                ),
                                                            }}
                                                            label="Prescription Window"
                                                            min="0"
                                                            max="9999"
                                                            fullWidth={false}
                                                            style={{ width: "100%" }}
                                                            classes={{
                                                                root: classes.mRight,
                                                            }}
                                                            disabled={modifyMode}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Enter the minimum number of consecutive windows with prescription">
                                                        <NumberInput
                                                            size="small"
                                                            defaultValue={row.months}
                                                            label="Consecutive Windows"
                                                            name={type + row._id + "months"}
                                                            onChange={e =>
                                                                handleInputChange(
                                                                    row._id,
                                                                    "months",
                                                                    Number(e.target.value)
                                                                )
                                                            }
                                                            min="0"
                                                            max="99"
                                                            fullWidth={false}
                                                            style={{ width: "100%" }}
                                                            disabled={modifyMode}
                                                        />
                                                    </Tooltip>
                                                </>
                                            ) : row.incl === false && row.typeOfRecord === 3 ? (
                                                <NumberInput
                                                    size="small"
                                                    key={row.slNo}
                                                    InputProps={{
                                                        endAdornment: <NumberInputAdornment />,
                                                    }}
                                                    defaultValue={row.addSubDaysToIndex}
                                                    name={type + row._id + "addSubDaysToIndex"}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            row._id,
                                                            "addSubDaysToIndex",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    max="99999"
                                                    label="Days"
                                                    disabled={modifyMode}
                                                />
                                            ) : null}
                                        </StyledTableCell>

                                        <StyledTableCell>
                                            <>
                                                {row.incl === true ? (
                                                    <FormControl
                                                        className={classes.formControl}
                                                        size="small"
                                                    >
                                                        <InputLabel htmlFor="age-native-simple">
                                                            Match with
                                                        </InputLabel>
                                                        <Select
                                                            native
                                                            value={row.matchWith}
                                                            onChange={e => {
                                                                handleMatchPropertyUpdate(
                                                                    row,
                                                                    e.target.value
                                                                );
                                                            }}
                                                            label="Match with"
                                                            inputProps={{
                                                                name: `exposureType${type}{row._id}{row.matchWith}`,
                                                                id: `exposureType${type}{row._id}{row.matchWith}`,
                                                                disabled: modifyMode,
                                                            }}
                                                        >
                                                            <>
                                                                {matchWithCodes.map(code => {
                                                                    return (
                                                                        <option
                                                                            value={code.value}
                                                                            key={code.value}
                                                                        >
                                                                            {code.label}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </>
                                                        </Select>
                                                    </FormControl>
                                                ) : null}
                                            </>
                                        </StyledTableCell>

                                        <StyledTableCell>
                                            {row.incl === true ? (
                                                <NumberInput
                                                    size="small"
                                                    key={row.slNo}
                                                    defaultValue={row.beforeDays}
                                                    name={type + row._id + "beforeDays"}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            row._id,
                                                            "beforeDays",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    min="0"
                                                    max="9999"
                                                    disabled={modifyMode}
                                                />
                                            ) : null}
                                        </StyledTableCell>

                                        <StyledTableCell>
                                            {row.incl === true ? (
                                                <NumberInput
                                                    size="small"
                                                    key={row.slNo}
                                                    defaultValue={row.afterDays}
                                                    name={type + row._id + "afterDays"}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            row._id,
                                                            "afterDays",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    min="0"
                                                    max="9999"
                                                    disabled={modifyMode}
                                                />
                                            ) : null}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <>
                                                {type === AHD_BEAN_LIST_LABEL ? (
                                                    <>
                                                        <FilterListIcon
                                                            aria-label="queryBuilder"
                                                            color="secondary"
                                                            style={{
                                                                display:
                                                                    mode === "modify"
                                                                        ? "none"
                                                                        : "inline",
                                                            }}
                                                            onClick={() =>
                                                                handleBuildQueryModal(row)
                                                            }
                                                        ></FilterListIcon>
                                                    </>
                                                ) : null}
                                                <DeleteOutlineOutlinedIcon
                                                    aria-label="delete"
                                                    color="secondary"
                                                    onClick={() => handleRowDelete(row._id, row)}
                                                    style={{
                                                        display:
                                                            mode === "modify" ? "none" : "inline",
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
    unexposed: PropTypes.object.isRequired,
    expose: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    codes: PropTypes.object.isRequired,
};

//#endregion

//#region

export const NeedControl = observer(({ unexposed, studyHasExposure, mode, studyDesign }) => {
    const { ctrlsNeeded } = unexposed.data;

    let controlValue = ctrlsNeeded;

    if (studyHasExposure === false) {
        unexposed.set("ctrlsNeeded", false); // Update Store
        controlValue = false; // Update Value.
    }

    const controlsRequired =
        studyDesign === CASE_CONTROL ? STUDY_NEED_UNEXPOSED_FOR_CASE_CONTROL : STUDY_NEED_UNEXPOSED;

    return (
        <>
            <CardHeader title="Comparator Group" />
            <div style={{ marginLeft: "10px", width: "50%" }}>
                <br />
                <FormLabel component="legend"> {controlsRequired} </FormLabel>
                <Radiogroup
                    disabled={studyHasExposure === false || mode === "modify"}
                    value={controlValue === undefined ? false : controlValue}
                    handleChange={e =>
                        unexposed.set("ctrlsNeeded", stringToBoolean(e.target.value))
                    }
                    radioOptions={radioOptionsControlYesNo}
                />
            </div>
        </>
    );
});

//#endregion

//#region  - Main
export const Control = observer(props => {
    const {
        // codes,
        unexposed,
        studyHasExposure,
        mode,
        studyDesign,
    } = props;

    const { pharmacoEpiDesign } = unexposed.data;

    React.useEffect(() => {
        unexposed.create();
    }, [unexposed]);

    const classes = useStyles();
    const { ctrlsNeeded } = props.unexposed.data;
    const modifyMode = mode === "modify";

    const controlIndexDate =
        studyDesign === CASE_CONTROL
            ? "The Control Index Date should be"
            : "The unexposed participant's Index date should be";

    const haveDrugCodeIncluded =
        props.unexposed.data.clinicalCodeListTherapy?.length > 0 &&
        props.unexposed.data.clinicalCodeListTherapy?.some(item => item.incl === true);

    React.useEffect(() => {
        if (!haveDrugCodeIncluded) {
            unexposed.set("pharmacoEpiDesign", 1);
        }
    }, [haveDrugCodeIncluded]);

    return (
        <>
            <CssBaseline />
            <Paper className={classes.paper}>
                <NeedControl
                    studyHasExposure={studyHasExposure}
                    unexposed={unexposed}
                    mode={mode}
                    studyDesign={studyDesign}
                />
            </Paper>
            <br />
            {ctrlsNeeded === true ? (
                <>
                    <Paper className={classes.paper}>
                        <AddCodesAndDisplayTables {...props} />
                    </Paper>
                    <br />
                    <Paper className={classes.paper}>
                        <CardHeader title={controlIndexDate} />
                        {haveDrugCodeIncluded ? (
                            <Radiogroup
                                name="radioStudyIndexDate"
                                value={
                                    pharmacoEpiDesign === 1 || pharmacoEpiDesign === 2
                                        ? pharmacoEpiDesign
                                        : 1
                                }
                                handleChange={e =>
                                    unexposed.set("pharmacoEpiDesign", Number(e.target.value))
                                }
                                radioOptions={
                                    studyDesign === CASE_CONTROL
                                        ? radioOptionsControlIndexDateForCaseControl
                                        : radioOptionsControlIndexDate
                                }
                                disabled={modifyMode}
                            />
                        ) : studyDesign === CASE_CONTROL ? (
                            SAME_AS_EXPOSED_INDEX_FOR_CASE_CONTROL
                        ) : (
                            SAME_AS_EXPOSED_INDEX
                        )}
                    </Paper>
                    <br />

                    <Combination
                        code={unexposed}
                        mode={mode}
                        showOperators={false}
                        identifier="controlParseStrict"
                        tab="Control"
                    />
                </>
            ) : null}
        </>
    );
});

//#endregion
