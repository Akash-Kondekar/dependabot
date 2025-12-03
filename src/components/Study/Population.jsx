import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
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
    Collapse,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid2 as Grid,
    InputLabel,
    Paper,
    Select,
    Switch,
    Tooltip,
} from "@mui/material";
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

import { useStyles } from "../useStyles";
import CssBaseline from "@mui/material/CssBaseline";
import studyDatabase from "../../state/store/study/database";
import { AddCodes } from "./AddCode";

import FilterListIcon from "@mui/icons-material/FilterList";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import IconButton from "@mui/material/IconButton";

import {
    AHD_BEAN_LIST_LABEL,
    AMR_DATE_FULL,
    CLINICAL_CODELIST_MEDICAL_LABEL,
    CLINICAL_CODELIST_THERAPY_LABEL,
    EMR_SYSTEM,
    PATIENT_AGE_FULL,
    PATIENT_AGE_MAX_FULL,
    PATIENT_EXIT_AGE_FULL,
    PATIENT_REGISTERED_FULL,
    radioOptionsExposedYesNo,
    radioOptionsSexOfThePopulation,
    STUDY_DRUGS,
    STUDY_MEDS,
    STUDY_NEED_EXPOSURE_FOR_INV_PREV_AND_CROSS_SECTIONAL,
} from "../../constants";
import extractJsonObject from "./Parser";

import { Edit } from "@mui/icons-material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Combination from "./Combination";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { NumberInputAdornment } from "../Common/NumberInputAdornment";
import { ShowWarning } from "../../componentsV2/Common/Toast";

const POPULATION = "Population";

export const AnyPopulation = observer(({ period, mode }) => {
    const {
        population: { casesNeeded = false },
    } = period.data;

    return (
        <>
            <CardHeader title="Study Population" />
            <div style={{ marginLeft: "10px", width: "50%" }}>
                <br />
                <FormLabel component="legend">
                    {STUDY_NEED_EXPOSURE_FOR_INV_PREV_AND_CROSS_SECTIONAL}
                </FormLabel>
                <Radiogroup
                    value={casesNeeded === undefined ? true : casesNeeded}
                    handleChange={e => {
                        period.set("casesNeeded", stringToBoolean(e.target.value));
                    }}
                    radioOptions={radioOptionsExposedYesNo}
                    disabled={mode === "modify"}
                />
            </div>
        </>
    );
});

const PatientDetails = observer(({ period, mode }) => {
    const { minAge, maxAge, maxAgeAtExit, sex } = period.data;

    const verify = () => {
        const minAgeValue = Number(document.getElementById("minAge")?.value ?? "0");
        return minAgeValue === 0 ? 0 : minAgeValue >= 120 ? 120 : minAgeValue + 1;
    };
    const dataElements = [
        {
            key: "1",
            label: PATIENT_AGE_FULL,
            elName: "minAge",
            aria: PATIENT_AGE_FULL,
            value: minAge,
            validate: { min: 0, max: 120, maxLength: 3 },
        },
        {
            key: "2",
            label: PATIENT_AGE_MAX_FULL,
            elName: "maxAge",
            aria: PATIENT_AGE_MAX_FULL,
            value: maxAge,
            validate: {
                min: document.getElementById("minAge")?.value || "0",
                max: 120,
                maxLength: 3,
            },
        },
        {
            key: "3",
            label: PATIENT_EXIT_AGE_FULL,
            elName: "maxAgeAtExit",
            aria: PATIENT_EXIT_AGE_FULL,
            value: maxAgeAtExit,
            validate: {
                min: verify(),
                max: 120,
                maxLength: 3,
            },
        },
    ];

    return (
        <>
            <CardHeader title="Participant Details" />
            <Grid container>
                {dataElements.map(input => {
                    return (
                        <React.Fragment key={input.label}>
                            <Grid style={{ alignSelf: "center" }} size={6}>
                                <FormLabel component="legend">{input.label}</FormLabel>
                            </Grid>
                            <Grid size={6}>
                                <NumberInput
                                    size="small"
                                    name={input.elName}
                                    id={input.elName}
                                    key={input.elName}
                                    onChange={e => {
                                        period.updateValue(e);
                                    }}
                                    value={input.value?.toString() || ""}
                                    min={input.validate.min}
                                    max={input.validate.max}
                                    disabled={mode === "modify"}
                                />
                            </Grid>
                        </React.Fragment>
                    );
                })}
                <Grid style={{ alignSelf: "center" }} size={6}>
                    <FormLabel component="legend">Participant’s sex</FormLabel>
                </Grid>
                <Grid size={6}>
                    <Radiogroup
                        value={sex === undefined ? 0 : sex}
                        handleChange={e => {
                            period.setValue("sex", parseInt(e.target.value));
                        }}
                        radioOptions={radioOptionsSexOfThePopulation}
                        disabled={mode === "modify"}
                    />
                </Grid>
            </Grid>
        </>
    );
});

const PracticeStartDuration = observer(({ period, mode }) => {
    const { addToPatientReg, addToPracticeDate1, addToPracticeDate2 } = period.data;
    const dataElements = [
        {
            key: "1",
            label: AMR_DATE_FULL,
            elName: "addToPracticeDate1",
            id: "addToPracticeDate1",
            aria: AMR_DATE_FULL,
            value: addToPracticeDate1,
            validate: { min: 0, max: 3650 },
        },
        {
            key: "2",
            label: PATIENT_REGISTERED_FULL,
            elName: "addToPatientReg",
            aria: PATIENT_REGISTERED_FULL,
            value: addToPatientReg,
            validate: {
                min: 0,
                max: 3650,
            },
        },
    ];

    const dataElementsForIMRD = [
        {
            key: "1",
            label: AMR_DATE_FULL,
            elName: "addToPracticeDate1",
            id: "addToPracticeDate1",
            aria: AMR_DATE_FULL,
            value: addToPracticeDate1,
            validate: { min: 0, max: 3650 },
        },
        {
            key: "2",
            label: EMR_SYSTEM,
            elName: "addToPracticeDate2",
            id: "addToPracticeDate2",
            aria: EMR_SYSTEM,
            value: addToPracticeDate2,
            validate: { min: 0, max: 3650 },
        },
        {
            key: "3",
            label: PATIENT_REGISTERED_FULL,
            elName: "addToPatientReg",
            aria: PATIENT_REGISTERED_FULL,
            value: addToPatientReg,
            validate: {
                min: 0,
                max: 3650,
            },
        },
    ];
    const [expanded, setExpanded] = React.useState("false");

    const handleExpandClick = () => {
        if (expanded === "false") {
            setExpanded("true");
        } else {
            setExpanded("false");
        }
    };

    return (
        <>
            <Grid container>
                <Grid
                    size={{
                        lg: 10,
                        md: 10,
                        sm: 10,
                    }}
                >
                    <CardHeader title="Study Quality" />
                </Grid>
                <Grid
                    container
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    size={{
                        lg: 2,
                        md: 2,
                        sm: 2,
                    }}
                >
                    <Edit
                        expand={(expanded === "false").toString()}
                        onClick={handleExpandClick}
                        aria-expanded={expanded === "false"}
                        aria-label="show more"
                    />
                </Grid>
            </Grid>
            <Collapse in={expanded === "false"} timeout="auto" unmountOnExit>
                <Grid container>
                    {(studyDatabase.data?.id?.toString() === "2"
                        ? dataElementsForIMRD
                        : dataElements
                    ).map(input => {
                        return (
                            <React.Fragment key={input.key}>
                                <Grid style={{ alignSelf: "center" }} key={input.key} size={6}>
                                    <FormLabel component="legend">{input.label}</FormLabel>
                                </Grid>
                                <Grid size={6}>
                                    <NumberInput
                                        size="small"
                                        type="number"
                                        InputProps={{
                                            endAdornment: <NumberInputAdornment />,
                                        }}
                                        name={input.elName}
                                        value={input.value?.toString() || ""}
                                        id={input.elName}
                                        onChange={e => {
                                            period.updateValue(e);
                                        }}
                                        min={input.validate.min}
                                        max={input.validate.max}
                                        disabled={mode === "modify"}
                                    />
                                </Grid>
                            </React.Fragment>
                        );
                    })}
                </Grid>
            </Collapse>
        </>
    );
});

const CollectCodes = observer(({ period, type, mode, codes }) => {
    const classes = useStyles();

    const [queryValue, setQueryValue] = React.useState({});
    const [open, setOpen] = React.useState(false);
    const [rowSelected, setRowSelected] = React.useState(false);

    const getIdentifier = type =>
        type === CLINICAL_CODELIST_THERAPY_LABEL || type === CLINICAL_CODELIST_MEDICAL_LABEL
            ? "filename"
            : "ahdCode";

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

    const handleInputChange = (_id, item, value) => {
        const identifier = getIdentifier(type);

        for (let index = 0; index < period.data?.population[type]?.length; index++) {
            const e = period.data?.population[type][index];
            const i = index;

            if (e[identifier] === _id) {
                //item, code, index, value
                period.setPopulationValue(item, type, i, value);
                break;
            }
        }
    };

    const handleQueryChange = query => {
        const identifier = getIdentifier(type);
        const { sqlQuery } = query;

        for (let index = 0; index < period.data.population?.ahdBeanList.length; index++) {
            const e = period.data.population?.ahdBeanList[index];
            const i = index;

            if (e[identifier] === rowSelected._id) {
                period.setPopulationValue("userQuery", AHD_BEAN_LIST_LABEL, i, sqlQuery);
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
            if (period.data.population?.finalInclusion?.length !== 1) {
                // Trying to Exclude
                // Check if value is present in inclusion string.
                if (period.data.population?.inclusion?.indexOf(valueToExclude) !== -1) {
                    ShowWarning(
                        "Cannot Exclude. Please remove this variable from the combination and try again."
                    );
                    return;
                }
            } else {
                const label = getCodeName(type);
                period.updateFinalInclusion(newRowData[label], value); // This could be the reason for  additions of deleted codes.
            }
        }

        for (let index = 0; index < period.data.population[type]?.length; index++) {
            const e = period.data.population[type][index];
            const i = index;

            if (e[identifier] === newRowData._id) {
                period.setInclude(type, i, value);

                // Also update the final Inclusion array.
                // Check if Array already has this item, If no Insert.
                const label = getCodeName(type);
                period.updateFinalInclusion(newRowData[label], value); // This could be the reason for  additions of deleted codes.

                break;
            }
        }
        if (period.data.population?.finalInclusion?.length === 0) {
            period.set("inclusion", "");
        }
    };

    const handleDropDownUpdate = (newRowData, value, incl) => {
        const identifier = getIdentifier(type);

        for (let index = 0; index < period.data.population[type].length; index++) {
            const e = period.data.population[type][index];
            const i = index;

            if (e[identifier] === newRowData._id) {
                if (incl) {
                    period.setExposureType(type, i, value);
                } else {
                    period.setTypeOfRecord(type, i, value);
                }
                break;
            }
        }
    };

    const handleRowDelete = (_id, row) => {
        const identifier = getIdentifier(type);
        const valueToDelete = row[getCodeName(type)];

        if (period.data.population?.finalInclusion?.length !== 1) {
            // Check if the value is present in Combination String.
            if (period.data.population.inclusion?.indexOf(valueToDelete) !== -1) {
                ShowWarning("To Delete please remove this variable from the combination");
                return;
            }
        }

        // Check its the value in present in finalInclusion Array. If Yes, Remove it.
        period.updateFinalInclusion(valueToDelete, false); // false means exclude  or remove from FinalInclusion array.

        for (let index = 0; index < period.data.population[type].length; index++) {
            const e = period.data.population[type][index];
            const i = index;

            if (e[identifier] === _id) {
                period.unSelectItem(type, i);
                break;
            }
        }

        if (period.data.population?.finalInclusion?.length === 0) {
            period.set("inclusion", "");
        }
    };

    const data = period.data.population[type];
    const rows = addSlNo(data);

    // Build code index for sync detection - determine fileType based on type
    const getFileTypeForIndex = () => {
        if (type === CLINICAL_CODELIST_MEDICAL_LABEL) return STUDY_MEDS;
        if (type === CLINICAL_CODELIST_THERAPY_LABEL) return STUDY_DRUGS;
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

            // Update period store with latest code data
            const identifier = getIdentifier(type);
            for (let index = 0; index < period.data.population[type].length; index++) {
                const e = period.data.population[type][index];
                if (e[identifier] === row._id) {
                    if (updated.filename !== undefined)
                        period.setPopulationValue("filename", type, index, updated.filename);
                    if (updated.codes !== undefined)
                        period.setPopulationValue("codes", type, index, updated.codes);
                    if (updated.label !== undefined)
                        period.setPopulationValue("label", type, index, updated.label);
                    if (updated.lastModifiedOn !== undefined)
                        period.setPopulationValue(
                            "lastModifiedOn",
                            type,
                            index,
                            updated.lastModifiedOn
                        );
                    if (updated.lastModifiedBy !== undefined)
                        period.setPopulationValue(
                            "lastModifiedBy",
                            type,
                            index,
                            updated.lastModifiedBy
                        );
                    if (updated.id !== undefined)
                        period.setPopulationValue("id", type, index, updated.id);
                    break;
                }
            }

            // Update codes store to refresh the codeIndex with latest timestamps
            const codeType = type === CLINICAL_CODELIST_MEDICAL_LABEL ? "medical" : "drug";
            codes.updateCodeList(outOfSyncVariable, codeType, {
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
                                <StyledTableCell style={{ width: "5%" }}>Sl No</StyledTableCell>
                                <StyledTableCell style={{ width: "20%" }}>
                                    {type === CLINICAL_CODELIST_MEDICAL_LABEL
                                        ? "Medical "
                                        : type === CLINICAL_CODELIST_THERAPY_LABEL
                                          ? "Drug "
                                          : "AHD "}
                                    Codes
                                </StyledTableCell>
                                <StyledTableCell style={{ width: "15%" }}>Criteria</StyledTableCell>
                                <StyledTableCell style={{ width: "20%" }}>Type</StyledTableCell>
                                <StyledTableCell style={{ width: "30%" }}>Options</StyledTableCell>
                                <StyledTableCell style={{ width: "10%" }}>Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(row => {
                                row._id =
                                    type === CLINICAL_CODELIST_THERAPY_LABEL ||
                                    type === CLINICAL_CODELIST_MEDICAL_LABEL
                                        ? row.filename
                                        : //row.id
                                          row.ahdCode;

                                return (
                                    <StyledTableRow key={row.slNo}>
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
                                                                disabled={mode === "modify"}
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
                                            <>
                                                <FormControl
                                                    className={classes.formControl}
                                                    size="small"
                                                >
                                                    <InputLabel htmlFor={`type${row._id}`}>
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
                                                        inputProps={{
                                                            name: `type${row._id}`,
                                                            id: `type${row._id}`,
                                                            disabled: mode === "modify",
                                                        }}
                                                    >
                                                        {row.incl === true ? (
                                                            <InclusionTypes
                                                                mode={mode}
                                                                tab="Exposure"
                                                            />
                                                        ) : (
                                                            <ExclusionTypes mode={mode} />
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
                                                        title="Enter the number of days that define one window during which at least one
   prescription should be recorded for the medication"
                                                    >
                                                        <NumberInput
                                                            size={"small"}
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
                                                            style={{ width: "50%" }}
                                                            classes={{
                                                                root: classes.mRight, // class name, e.g. `classes-nesting-root-x`
                                                            }}
                                                            disabled={mode === "modify"}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Enter the minimum number of consecutive windows with prescription">
                                                        <NumberInput
                                                            size={"small"}
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
                                                            style={{ width: "40%" }}
                                                            disabled={mode === "modify"}
                                                        />
                                                    </Tooltip>
                                                </>
                                            ) : null}

                                            {row.incl === false && row.typeOfRecord === 3 ? (
                                                <NumberInput
                                                    InputProps={{
                                                        endAdornment: <NumberInputAdornment />,
                                                    }}
                                                    size={"small"}
                                                    defaultValue={row.addSubDaysToIndex}
                                                    name={type + row._id + "addSubDaysToIndex"}
                                                    onChange={e =>
                                                        handleInputChange(
                                                            row._id,
                                                            "addSubDaysToIndex",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    min="1"
                                                    max="9999"
                                                    label="Days"
                                                    disabled={mode === "modify"}
                                                />
                                            ) : null}
                                        </StyledTableCell>

                                        <StyledTableCell>
                                            <FormControl size="small">
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
                                                                        mode === "modify"
                                                                            ? "none"
                                                                            : "inline",
                                                                }}
                                                            ></FilterListIcon>
                                                        </>
                                                    ) : null}

                                                    <DeleteOutlineOutlinedIcon
                                                        aria-label="delete"
                                                        style={{
                                                            display:
                                                                mode === "modify"
                                                                    ? "none"
                                                                    : "inline",
                                                        }}
                                                        color="secondary"
                                                        onClick={() =>
                                                            handleRowDelete(row._id, row)
                                                        }
                                                    ></DeleteOutlineOutlinedIcon>
                                                </>
                                            </FormControl>
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
    period: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    codes: PropTypes.object.isRequired,
};

const AddCodesAndDisplayTables = observer(props => {
    const [readCodes, setReadCodes] = React.useState([]);
    const [drugCodes, setDrugCodes] = React.useState([]);
    const [ahdCodes, setAHDCodes] = React.useState([]);

    const { period, codes, mode } = props;

    React.useEffect(() => {
        (async () => {
            let filteredData = readCodes.filter(
                code =>
                    !period.data.population?.clinicalCodeListMedical.find(
                        e => code.filename === e.filename
                    )
            );
            filteredData.forEach(input => {
                period.addReadCode(input);
            });

            filteredData = drugCodes.filter(
                code =>
                    !period.data.population?.clinicalCodeListTherapy.find(
                        e => code.filename === e.filename
                    )
            );
            filteredData.forEach(input => {
                period.addDrugCode(input);
            });

            filteredData = ahdCodes.filter(
                code => !period.data.population?.ahdBeanList.find(e => code.ahdCode === e.ahdCode)
            );
            filteredData.forEach(input => {
                period.addAHDCode(input);
            });
        })();
    }, [readCodes, drugCodes, ahdCodes, period]);

    const rest = {
        setReadCodes,
        setDrugCodes,
        setAHDCodes,
        readCodes,
        drugCodes,
        ahdCodes,
        store: period,
        mode,
    };

    return (
        <>
            <div>
                <AddCodes codes={codes} tab={POPULATION} {...rest} />
                <br />
                <CollectCodes type={CLINICAL_CODELIST_THERAPY_LABEL} {...props} />
                <CollectCodes type={CLINICAL_CODELIST_MEDICAL_LABEL} {...props} />
                <CollectCodes type={AHD_BEAN_LIST_LABEL} {...props} />
            </div>
        </>
    );
});

export const Population = observer(props => {
    const classes = useStyles();

    const {
        population: { casesNeeded = false },
    } = props.period.data;

    return (
        <>
            <CssBaseline />

            <Paper className={classes.paper}>
                <PracticeStartDuration {...props} />
            </Paper>
            <br />

            <Paper className={classes.paper}>
                <PatientDetails {...props} />
            </Paper>
            <br />

            <Paper className={classes.paper}>
                <AnyPopulation {...props} />
            </Paper>
            <br />

            {casesNeeded === true && (
                <>
                    <Paper className={classes.paper}>
                        <AddCodesAndDisplayTables {...props} />
                    </Paper>
                    <br />
                    <Combination
                        code={props.period}
                        mode={props.mode}
                        showOperators={false}
                        identifier="caseParseStrict"
                        tab={POPULATION}
                    />
                </>
            )}
        </>
    );
});
