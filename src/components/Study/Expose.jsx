import React from "react";
import PropTypes from "prop-types";
import {
    FormControl,
    FormLabel,
    Grid2 as Grid,
    InputLabel,
    OutlinedInput,
    Paper,
    Select,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { useStyles } from "../useStyles";
import { observer } from "mobx-react";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
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
import { AddCodes } from "./AddCode";
import Combination from "./Combination";
import {
    AHD_BEAN_LIST_LABEL,
    CASE_CONTROL,
    CASE_DRUGS,
    CASE_MEDS,
    CLINICAL_CODELIST_MEDICAL_LABEL,
    CLINICAL_CODELIST_THERAPY_LABEL,
    CROSS_SECTIONAL,
    INC_PREV,
    radioOptionsExposedYesNo,
    STUDY_NEED_EXPOSURE,
    STUDY_NEED_EXPOSURE_FOR_CASE_CONTROL,
    STUDY_NEED_EXPOSURE_FOR_INV_PREV_AND_CROSS_SECTIONAL,
} from "../../constants";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import FilterListIcon from "@mui/icons-material/FilterList";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import IconButton from "@mui/material/IconButton";
import studyDatabase from "../../state/store/study/database";
import unexposed from "../../state/store/study/unexposed";
import extractJsonObject from "./Parser";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { NumberInputAdornment } from "../Common/NumberInputAdornment";
import { ShowWarning } from "../../componentsV2/Common/Toast";

//#region - One Table

const CollectCodes = observer(({ expose, type, mode, codes }) => {
    const classes = useStyles();

    const [queryValue, setQueryValue] = React.useState({});
    const [open, setOpen] = React.useState(false);
    const [rowSelected, setRowSelected] = React.useState(false);

    const getIdentifier = type =>
        type === CLINICAL_CODELIST_THERAPY_LABEL || type === CLINICAL_CODELIST_MEDICAL_LABEL
            ? "filename"
            : //"id"
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

    const handleInputChange = (_id, item, value) => {
        const identifier = getIdentifier(type);

        for (let index = 0; index < expose.data[type].length; index++) {
            const e = expose.data[type][index];
            const i = index;

            if (e[identifier] === _id) {
                //item, code, index, value
                expose.setValue(item, type, i, value);
                break;
            }
        }
    };

    const handleQueryChange = query => {
        const identifier = getIdentifier(type);
        const { sqlQuery } = query;

        for (let index = 0; index < expose.data.ahdBeanList.length; index++) {
            const e = expose.data.ahdBeanList[index];
            const i = index;

            if (e[identifier] === rowSelected._id) {
                expose.setValue("userQuery", AHD_BEAN_LIST_LABEL, i, sqlQuery);
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
            if (expose.data?.finalInclusion?.length !== 1) {
                // Trying to Exclude
                // Check if value is present in inclusion string.
                if (expose.data.inclusion.indexOf(valueToExclude) !== -1) {
                    ShowWarning(
                        "Cannot Exclude. Please remove this variable from the combination and try again."
                    );
                    return;
                }
            } else {
                const label = getCodeName(type);
                expose.updateFinalInclusion(newRowData[label], value); // This could be the reason for  additions of deleted codes.
            }
            // Trying to Exclude
            // Check if value is present in inclusion string.
        }

        for (let index = 0; index < expose.data[type].length; index++) {
            const e = expose.data[type][index];
            const i = index;

            if (e[identifier] === newRowData._id) {
                expose.setInclude(type, i, value);

                // Also update the final Inclusion array.
                // Check if Array already has this item, If no Insert.
                const label = getCodeName(type);
                expose.updateFinalInclusion(newRowData[label], value); // This could be the reason for  additions of deleted codes.

                // You are excluding it.. Update control MatchWith if necessary.
                if (value === false) {
                    unexposed.updateMatchWith(label);
                }
                break;
            }
        }
        if (expose.data?.finalInclusion?.length === 0) {
            expose.set("inclusion", "");
        }
    };

    const handleDropDownUpdate = (newRowData, value, incl) => {
        const identifier = getIdentifier(type);

        for (let index = 0; index < expose.data[type].length; index++) {
            const e = expose.data[type][index];
            const i = index;

            if (e[identifier] === newRowData._id) {
                if (incl) {
                    expose.setExposureType(type, i, value);
                } else {
                    expose.setTypeOfRecord(type, i, value);
                }
                break;
            }
        }
    };

    const handleRowDelete = (_id, row) => {
        const identifier = getIdentifier(type);
        const valueToDelete = row[getCodeName(type)];

        // Check if the value is present in Combination String.
        if (expose.data?.finalInclusion?.length !== 1) {
            if (expose.data.inclusion.indexOf(valueToDelete) !== -1) {
                ShowWarning("To Delete please remove this variable from the combination");
                return;
            }
        }

        // Check its the value in present in finalInclusion Array. If Yes, Remove it.
        expose.updateFinalInclusion(valueToDelete, false); // false means exclude  or remove from FinalInclusion array.

        for (let index = 0; index < expose.data[type].length; index++) {
            const e = expose.data[type][index];
            const i = index;

            if (e[identifier] === _id) {
                expose.unSelectItem(type, i);
                break;
            }
        }

        if (expose.data?.finalInclusion?.length === 0) {
            expose.set("inclusion", "");
        }
    };

    const data = expose.data[type];
    const rows = addSlNo(data);

    // Build code index for sync detection
    const getFileTypeForIndex = () => {
        if (type === CLINICAL_CODELIST_MEDICAL_LABEL) return CASE_MEDS;
        if (type === CLINICAL_CODELIST_THERAPY_LABEL) return CASE_DRUGS;
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

            // Update expose store with latest code data
            const identifier = getIdentifier(type);
            for (let index = 0; index < expose.data[type].length; index++) {
                const e = expose.data[type][index];
                if (e[identifier] === row._id) {
                    if (updated.filename !== undefined)
                        expose.setValue("filename", type, index, updated.filename);
                    if (updated.codes !== undefined)
                        expose.setValue("codes", type, index, updated.codes);
                    if (updated.label !== undefined)
                        expose.setValue("label", type, index, updated.label);
                    if (updated.lastModifiedOn !== undefined)
                        expose.setValue("lastModifiedOn", type, index, updated.lastModifiedOn);
                    if (updated.lastModifiedBy !== undefined)
                        expose.setValue("lastModifiedBy", type, index, updated.lastModifiedBy);
                    if (updated.id !== undefined) expose.setValue("id", type, index, updated.id);
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
                                // const getRowId = (row, type) => type === "clinicalCodeListTherapy" || type === "clinicalCodeListMedical" ? row.filename : row.ahdCode;
                                // row._id is just a clear way to extract out the identifier.
                                // The way the current data works is, filename & ahdCode fields are considered as Unique Identifiers for each reads/meds.
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
                                                    <InputLabel id={`type${row._id}`}>
                                                        Type
                                                    </InputLabel>
                                                    <Select
                                                        labelId={`type${row._id}`}
                                                        input={<OutlinedInput label="Type" />}
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
                                                        title="Enter the amount of time that define one window during which at least one
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
                                                    size={"small"}
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
                                                    min="1"
                                                    max="99999"
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
    expose: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    codes: PropTypes.object.isRequired,
};

//#endregion

const AddCodesAndDisplayTables = observer(props => {
    const [readCodes, setReadCodes] = React.useState([]);
    const [drugCodes, setDrugCodes] = React.useState([]);
    const [ahdCodes, setAHDCodes] = React.useState([]);

    const { expose, codes, mode } = props;

    React.useEffect(() => {
        (async () => {
            let filteredData = readCodes.filter(
                code =>
                    !expose.data.clinicalCodeListMedical.find(
                        e => code.filename === e.filename
                        //(e) => code.id === e.id
                    )
            );
            filteredData.forEach(input => {
                expose.addReadCode(input);
            });

            filteredData = drugCodes.filter(
                code =>
                    !expose.data.clinicalCodeListTherapy.find(
                        e => code.filename === e.filename
                        //(e) => code.id === e.id
                    )
            );
            filteredData.forEach(input => {
                expose.addDrugCode(input);
            });

            filteredData = ahdCodes.filter(
                code => !expose.data.ahdBeanList.find(e => code.ahdCode === e.ahdCode)
            );
            filteredData.forEach(input => {
                expose.addAHDCode(input);
            });
        })();
    }, [readCodes, drugCodes, ahdCodes, expose]);

    const rest = {
        setReadCodes,
        setDrugCodes,
        setAHDCodes,
        readCodes,
        drugCodes,
        ahdCodes,
        store: expose,
        mode,
    };

    return (
        <>
            <div>
                <AddCodes codes={codes} tab="Exposure" {...rest} />
                <br />

                <CollectCodes type={CLINICAL_CODELIST_THERAPY_LABEL} {...props} />
                <CollectCodes type={CLINICAL_CODELIST_MEDICAL_LABEL} {...props} />
                <CollectCodes type={AHD_BEAN_LIST_LABEL} {...props} />
            </div>
        </>
    );
});

export const AnyExposure = observer(({ expose, mode, studyDesign }) => {
    const { casesNeeded } = expose.data;
    // Depend on DEX-134
    // const hasVariables =
    //   expose.data.clinicalCodeListTherapy.length > 0 ||
    //   expose.data.ahdBeanList.length > 0 ||
    //   expose.data.clinicalCodeListMedical.length > 0;

    // const disabled = mode === "modify" || hasVariables;

    let includesExposedGroups = STUDY_NEED_EXPOSURE;
    let title = "Study Exposure";

    if (studyDesign === CASE_CONTROL) {
        includesExposedGroups = STUDY_NEED_EXPOSURE_FOR_CASE_CONTROL;
        title = "Case";
    } else if (studyDesign === INC_PREV || studyDesign === CROSS_SECTIONAL) {
        includesExposedGroups = STUDY_NEED_EXPOSURE_FOR_INV_PREV_AND_CROSS_SECTIONAL;
        title = "Study Population";
    }

    return (
        <>
            <CardHeader title={title} />
            <div style={{ marginLeft: "10px", width: "50%" }}>
                <br />
                <FormLabel component="legend"> {includesExposedGroups} </FormLabel>
                <Radiogroup
                    value={casesNeeded === undefined ? true : casesNeeded}
                    handleChange={e => {
                        expose.set("casesNeeded", stringToBoolean(e.target.value));
                    }}
                    radioOptions={radioOptionsExposedYesNo}
                    disabled={mode === "modify"}
                    // disabled={disabled}
                />
            </div>
        </>
    );
});

export const Expose = observer(props => {
    const classes = useStyles();
    const { expose, mode, studyDesign } = props;

    React.useEffect(() => {
        expose.create();
    }, [expose]);

    const { casesNeeded } = props.expose.data;
    const isIncPrevOrCrossSectionalStudy =
        studyDesign === INC_PREV || studyDesign === CROSS_SECTIONAL;

    const showLatencyPeriod = !isIncPrevOrCrossSectionalStudy;

    return (
        <>
            <CssBaseline />
            <Paper className={classes.paper}>
                <AnyExposure {...props} />
            </Paper>
            <br />
            {casesNeeded === true ? (
                <>
                    <Paper className={classes.paper}>
                        <AddCodesAndDisplayTables {...props} />
                    </Paper>
                    <br />

                    <Combination
                        code={expose}
                        mode={mode}
                        showOperators={false}
                        identifier="caseParseStrict"
                        tab="Expose"
                    />
                    <br />
                    {showLatencyPeriod && (
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ArrowDropDownIcon />}
                                aria-controls="panel2-content"
                                id="panel2-header"
                            >
                                <Typography>Advanced Options</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>
                                    Would you like to add an interval (a latency or a lag period) to
                                    the index date? This represents the period after a participant
                                    meets all inclusion criteria, but before which you believe the
                                    participant is not expected to develop the outcome of interest.
                                    <Grid
                                        size={{
                                            xs: 4,
                                            md: 4,
                                            lg: 4,
                                        }}
                                    >
                                        <NumberInput
                                            size="small"
                                            name="latency"
                                            defaultValue={expose.data.washOutDays}
                                            onChange={e => {
                                                expose.set("washOutDays", Number(e.target.value));
                                            }}
                                            InputProps={{
                                                endAdornment: <NumberInputAdornment />,
                                            }}
                                            style={{ width: "inherit" }}
                                            min="0"
                                            max="99999"
                                            disabled={mode === "modify"}
                                        />
                                    </Grid>
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    )}
                </>
            ) : null}
        </>
    );
});
//#endregion
