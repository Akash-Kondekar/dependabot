import React from "react";
import PropTypes from "prop-types";
import { FormLabel, Paper, Tooltip } from "@mui/material";
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
import { AddCodes } from "./AddCode";

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
    AHD_BEAN_LIST_LABEL,
    BASELINE_AHD,
    BASELINE_DRUGS,
    BASELINE_MEDS,
    CASE_CONTROL,
    CLINICAL_CODELIST_GENERIC_LABEL,
    CLINICAL_CODELIST_MEDICAL_LABEL,
    CLINICAL_CODELIST_THERAPY_LABEL,
    COHORT,
    controlPracticesDropDown,
    radioOptionsControlGender,
    radioOptionsControlYesNo,
    radioOptionsExposedYesNo,
    radioOptionsMatchPrimaryExposureOnlyYesNo,
    STUDY_NEED_UN_EXPOSURE_MATCH,
    STUDY_SELECT_FROM_PRACTICE_UNEXPOSED,
    STUDY_SEX_MATCHING,
    STUDY_UNEXPOSED_DAYS_AFTER_EXPOSURE,
    STUDY_UNEXPOSED_DAYS_BEFORE_EXPOSURE,
    STUDY_UNEXPOSED_HOW_MANY,
    STUDY_UNEXPOSED_HOW_MANY_CASE_CONTROL,
    STUDY_UNEXPOSED_HOW_MANY_MONTHS_REGISTERED,
    STUDY_UNEXPOSED_HOW_MANY_MONTHS_REGISTERED_FOR_CASE_CONTROL,
    STUDY_UNEXPOSED_HOW_MANY_YEARS,
    STUDY_UNEXPOSED_HOW_MANY_YEARS_FOR_CASE_CONTROL,
    STUDY_UNEXPOSED_MATCH_ETHNICITY,
    STUDY_UNEXPOSED_MATCH_REGISTRATION,
    STUDY_UNEXPOSED_PRIMARY_ONLY_MATCH,
} from "../../constants";
import { NumberInputAdornment } from "../Common/NumberInputAdornment";

//#region - 1 Codes

const CollectCodes = observer(({ baseline, type, mode, fileType, codes }) => {
    const classes = useStyles();

    const [queryValue, setQueryValue] = React.useState({});
    const [open, setOpen] = React.useState(false);
    const [rowSelected, setRowSelected] = React.useState(false);
    const modifyMode = mode === "modify";

    const getIdentifier = type => (type === CLINICAL_CODELIST_GENERIC_LABEL ? "id" : "ahdCode");

    const handleClose = () => {
        setOpen(false);
    };

    // const handleBuildQueryModal = (row) => {
    //   setRowSelected(row);
    //   setOpen(true);
    // };

    const handleBuildQueryModal = row => {
        const jsonString = row.query;
        if (jsonString) {
            row.query = JSON.parse(jsonString);
        }
        setRowSelected(row);
        setOpen(true);
    };

    const handleQueryChange = query => {
        const identifier = getIdentifier(type);
        const { jsonQuery, sqlQuery } = query;

        for (let index = 0; index < baseline.data[type].length; index++) {
            const e = baseline.data[type][index];
            const i = index;

            if (
                e[identifier] === rowSelected._id &&
                rowSelected.enableMatchingBtn === true &&
                rowSelected.matchingReq === true &&
                rowSelected.incl === true &&
                e.uniqueKey === rowSelected.uniqueKey
            ) {
                baseline.setValue("query", type, i, jsonQuery);
                baseline.setValue("userQuery", type, i, sqlQuery);
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
        // description: getDescriptionFromADHCode(rowSelected.description ?? ""),
        description: getDescriptionFromADHCode(prepareAHDCodes(rowSelected).join() ?? ""),
    };

    const handleInputChange = (uniqueKey, item, value) => {
        for (let index = 0; index < baseline.data[type].length; index++) {
            const e = baseline.data[type][index];
            if (e.uniqueKey === uniqueKey) {
                //item, code, index, value
                baseline.setValue(item, type, index, value);
                break;
            }
        }
    };

    const handleRowDelete = uniqueKey => {
        for (let index = 0; index < baseline.data[type].length; index++) {
            const e = baseline.data[type][index];
            if (e.uniqueKey === uniqueKey) {
                baseline.unSelectItem(type, index);
                break;
            }
        }
    };

    const data =
        baseline &&
        baseline.data &&
        baseline.data[type] &&
        baseline.data[type].filter(code => {
            // if (code.isSelected === true) return code;
            // return code.isSelected === true;

            return type === AHD_BEAN_LIST_LABEL
                ? code.enableMatchingBtn === true &&
                      // code.isSelected === true &&
                      code.matchingReq === true &&
                      code.incl === true
                : code.matchingReq === true &&
                      // code.isSelected === true &&
                      code.fileType === fileType &&
                      code.incl === true;
        });

    let rows;
    if (data !== undefined) {
        rows = addSlNo(data);
    }

    const getType = (type, fileType) => {
        return type === CLINICAL_CODELIST_GENERIC_LABEL && fileType === BASELINE_MEDS
            ? CLINICAL_CODELIST_MEDICAL_LABEL
            : type === CLINICAL_CODELIST_GENERIC_LABEL && fileType === BASELINE_DRUGS
              ? CLINICAL_CODELIST_THERAPY_LABEL
              : AHD_BEAN_LIST_LABEL;
    };

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
            for (let index = 0; index < baseline?.data[type]?.length; index++) {
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
                                <StyledTableCell style={{ width: "5%" }}>Sl No</StyledTableCell>

                                <StyledTableCell style={{ width: "45%" }}>
                                    {type === CLINICAL_CODELIST_GENERIC_LABEL &&
                                    fileType === BASELINE_MEDS
                                        ? "Medical "
                                        : type === CLINICAL_CODELIST_GENERIC_LABEL &&
                                            fileType === BASELINE_DRUGS
                                          ? "Drug "
                                          : "AHD "}
                                    Codes
                                </StyledTableCell>
                                <StyledTableCell style={{ width: "40%" }}>
                                    +/- Duration For Matching
                                </StyledTableCell>

                                <StyledTableCell style={{ width: "10%" }}>Action</StyledTableCell>
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
                                //type === "clinicalCodeList" ? row.id : row.ahdCode;

                                return (
                                    <StyledTableRow key={row.uniqueKey + "match"}>
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
                                            <NumberInput
                                                size="small"
                                                defaultValue={
                                                    fileType === BASELINE_AHD
                                                        ? row.beforeDays
                                                        : row.months
                                                }
                                                InputProps={{
                                                    endAdornment: <NumberInputAdornment />,
                                                }}
                                                name={type + row._id + "months"}
                                                onChange={e =>
                                                    handleInputChange(
                                                        row.uniqueKey,
                                                        fileType === BASELINE_AHD
                                                            ? "beforeDays"
                                                            : "months",
                                                        Number(e.target.value)
                                                    )
                                                }
                                                max="36500"
                                                disabled={modifyMode}
                                            />
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
                                                                    mode === "modify"
                                                                        ? "none"
                                                                        : "inline",
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
    baseline: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    codes: PropTypes.object.isRequired,
};

//#endregion

const AddCodesAndDisplayTables = observer(props => {
    const [readCodes, setReadCodes] = React.useState([]);
    const [drugCodes, setDrugCodes] = React.useState([]);
    const [ahdCodes, setAHDCodes] = React.useState([]);

    const { baseline, codes, mode } = props;

    React.useEffect(() => {
        (async () => {
            // Ensure there are no duplicates.
            // When needed, We can Optimize this further by maintaining a lookup, instead of checking array.
            // Previously, have tried a set and ran into problems needing to convert set to array and vice versa.
            // Need to explore this further.
            let filterData = readCodes.filter(
                code =>
                    !baseline.data.clinicalCodeList.find(
                        e => code.filename === e.filename && e.matchingReq === true
                        //(e) => code.id === e.id && e.matchingReq === true
                    )
            );
            filterData.forEach(input => {
                input.matchingReq = true;
                // TODO : Check if duplicates are allowed..
                baseline.addReadCode(input);
            });

            filterData = drugCodes.filter(
                code =>
                    !baseline.data.clinicalCodeList.find(
                        e => code.filename === e.filename && e.matchingReq === true
                        //(e) => code.id === e.id && e.matchingReq === true
                    )
            );
            filterData.forEach(input => {
                input.matchingReq = true;
                baseline.addDrugCode(input);
            });
            filterData = ahdCodes.filter(
                code =>
                    !baseline.data.ahdBeanList.find(
                        e => code.ahdCode === e.ahdCode && e.matchingReq === true
                    )
            );
            filterData.forEach(input => {
                input.matchingReq = true;
                input.enableMatchingBtn = true;
                baseline.addAHDCode(input);
            });
        })();
    }, [readCodes, drugCodes, ahdCodes, baseline]);

    const rest = {
        setReadCodes,
        setDrugCodes,
        setAHDCodes,
        readCodes,
        drugCodes,
        ahdCodes,
        store: baseline,
        mode,
    };

    return (
        <>
            <div>
                <AddCodes codes={codes} tab="match" {...rest} />
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
                <br />
                {/*{JSON.stringify(baseline, false, 2)}*/}
            </div>
        </>
    );
});

//#endregion

export const MatchControl = observer(props => {
    const { unexposed, mode, studyDesign } = props;

    const [cCount, setControlCount] = React.useState(unexposed.data.noOfCtrl);
    const modifyMode = mode === "modify";

    React.useEffect(() => {
        unexposed.set("noOfCtrl", Number(cCount));
    }, [cCount, unexposed]);

    const {
        controlSelectionMethod,
        ctrlAgeRange,
        matchGender,
        matchRegDate,
        ctrlReg,
        matchOnEthnicity,
        matPriExpoBefDays,
        matPriExpoAftDays,
        matchOnlyPrimaryExpo,
        withRepetition,
        canCasesBeControls,
        propensityScore,
    } = unexposed.data;

    const matchCriteria = [
        {
            text: STUDY_UNEXPOSED_MATCH_ETHNICITY,
            value: matchOnEthnicity,
            handleChange: e => unexposed.set("matchOnEthnicity", stringToBoolean(e.target.value)),
        },
    ];

    const matchPrimary = [
        {
            text: STUDY_UNEXPOSED_PRIMARY_ONLY_MATCH,
            value: matchOnlyPrimaryExpo,
            handleChange: e =>
                unexposed.set("matchOnlyPrimaryExpo", stringToBoolean(e.target.value)),
        },
    ];

    const isCaseControlStudy = studyDesign === CASE_CONTROL;

    const canBecomeControl = isCaseControlStudy
        ? "Can individuals in the case group be selected as controls before they encounter the outcome? (Risk set sampling)"
        : "Can individuals in the exposed group be selected as unexposed participants before they encounter the exposure? (Risk set sampling)";

    const ageGap = isCaseControlStudy
        ? STUDY_UNEXPOSED_HOW_MANY_YEARS_FOR_CASE_CONTROL
        : STUDY_UNEXPOSED_HOW_MANY_YEARS;

    const howMany = isCaseControlStudy
        ? STUDY_UNEXPOSED_HOW_MANY_CASE_CONTROL
        : STUDY_UNEXPOSED_HOW_MANY;

    const repetition = isCaseControlStudy
        ? "Do you want to select controls with repetition?"
        : "Do you want to select unexposed participants with repetition?";

    const numberOfMonths = isCaseControlStudy
        ? STUDY_UNEXPOSED_HOW_MANY_MONTHS_REGISTERED_FOR_CASE_CONTROL
        : STUDY_UNEXPOSED_HOW_MANY_MONTHS_REGISTERED;

    const controlSelectionLabel = studyDesign === COHORT ? "Select" : "Control Selection";

    return (
        <>
            <CardHeader title="Matching Criteria" />
            <div style={{ marginLeft: "10px", width: "100%" }}>
                <>
                    <Row label={howMany} itemSizeOne={8} itemSizeTwo={3}>
                        <NumberInput
                            size="small"
                            // defaultValue={noOfCtrl}
                            value={cCount}
                            name={howMany}
                            onChange={e => {
                                setControlCount(e.target.value);
                            }}
                            max="36500"
                            disabled={modifyMode}
                        />
                    </Row>

                    <Row label={ageGap} itemSizeOne={8} itemSizeTwo={3}>
                        <NumberInput
                            size="small"
                            defaultValue={ctrlAgeRange}
                            name={ageGap}
                            onChange={e => {
                                unexposed.set("ctrlAgeRange", Number(e.target.value));
                            }}
                            min="0"
                            max="36500"
                            disabled={modifyMode}
                        />
                    </Row>
                </>
                <Row label={STUDY_SEX_MATCHING} itemSizeOne={8} itemSizeTwo={3}>
                    <Radiogroup
                        name="radioStudyGender"
                        value={matchGender}
                        handleChange={e => unexposed.set("matchGender", Number(e.target.value))}
                        radioOptions={radioOptionsControlGender}
                        disabled={modifyMode}
                    />
                </Row>
                <br />
                <Row label={STUDY_SELECT_FROM_PRACTICE_UNEXPOSED} itemSizeOne={8} itemSizeTwo={3}>
                    <Dropdown
                        ddLabel="Practice"
                        labelName="controlSelectionMethod"
                        labelValue={controlSelectionLabel}
                        value={controlSelectionMethod === undefined ? 1 : controlSelectionMethod}
                        handleChange={e =>
                            unexposed.set("controlSelectionMethod", Number(e.target.value))
                        }
                        dropdownOptions={controlPracticesDropDown}
                        disabled={modifyMode}
                    />
                </Row>
                <br />

                {matchCriteria.map((criteria, index) => {
                    return (
                        <React.Fragment key={index}>
                            <Row label={criteria.text} itemSizeOne={8} itemSizeTwo={3}>
                                <Radiogroup
                                    name={`radioStudyExposure-${index}`}
                                    value={criteria.value}
                                    handleChange={criteria.handleChange}
                                    radioOptions={radioOptionsControlYesNo}
                                    disabled={modifyMode}
                                />
                            </Row>

                            <br />
                        </React.Fragment>
                    );
                })}
                <Row label={STUDY_UNEXPOSED_MATCH_REGISTRATION} itemSizeOne={8} itemSizeTwo={3}>
                    <Radiogroup
                        name="radioStudyMatchRegistration"
                        value={matchRegDate}
                        handleChange={e =>
                            unexposed.set("matchRegDate", stringToBoolean(e.target.value))
                        }
                        radioOptions={radioOptionsControlYesNo}
                        disabled={modifyMode}
                    />
                </Row>
                <br />
                {matchRegDate === true ? (
                    <>
                        <Row label={numberOfMonths} itemSizeOne={8} itemSizeTwo={3}>
                            <NumberInput
                                InputProps={{
                                    endAdornment: <NumberInputAdornment />,
                                }}
                                size="small"
                                defaultValue={ctrlReg}
                                name={numberOfMonths}
                                onChange={e => {
                                    unexposed.set("ctrlReg", Number(e.target.value));
                                }}
                                min="0"
                                max="36500"
                                disabled={modifyMode}
                            />
                        </Row>

                        <br />
                    </>
                ) : null}

                <Row label={repetition} itemSizeOne={8} itemSizeTwo={3}>
                    <Radiogroup
                        name="radioStudyRepetition"
                        value={withRepetition}
                        handleChange={e =>
                            unexposed.set("withRepetition", stringToBoolean(e.target.value))
                        }
                        radioOptions={radioOptionsControlYesNo}
                        disabled={modifyMode}
                    />
                </Row>
                <br />
                <Row label={canBecomeControl} itemSizeOne={8} itemSizeTwo={3}>
                    <Radiogroup
                        name="radioStudyBecomeControl"
                        value={canCasesBeControls}
                        handleChange={e =>
                            unexposed.set("canCasesBeControls", stringToBoolean(e.target.value))
                        }
                        radioOptions={radioOptionsControlYesNo}
                        disabled={modifyMode}
                    />
                </Row>
                <br />

                {matchPrimary.map((criteria, index) => {
                    return (
                        <React.Fragment key={index}>
                            <Row label={criteria.text} itemSizeOne={8} itemSizeTwo={3}>
                                <Radiogroup
                                    name={`radioStudyExposure-${index}`}
                                    value={criteria.value}
                                    handleChange={criteria.handleChange}
                                    radioOptions={radioOptionsControlYesNo}
                                    disabled={modifyMode}
                                />
                            </Row>

                            <br />
                        </React.Fragment>
                    );
                })}

                {matchOnlyPrimaryExpo === true ? (
                    <>
                        <Row
                            label={STUDY_UNEXPOSED_DAYS_BEFORE_EXPOSURE}
                            itemSizeOne={8}
                            itemSizeTwo={3}
                        >
                            <NumberInput
                                size="small"
                                InputProps={{
                                    endAdornment: <NumberInputAdornment />,
                                }}
                                defaultValue={matPriExpoBefDays}
                                name={STUDY_UNEXPOSED_DAYS_BEFORE_EXPOSURE}
                                onChange={e => {
                                    unexposed.set("matPriExpoBefDays", Number(e.target.value));
                                }}
                                min="0"
                                max="36500"
                                disabled={modifyMode}
                            />
                        </Row>

                        <br />
                        <Row
                            label={STUDY_UNEXPOSED_DAYS_AFTER_EXPOSURE}
                            itemSizeOne={8}
                            itemSizeTwo={3}
                        >
                            <NumberInput
                                size="small"
                                defaultValue={matPriExpoAftDays}
                                InputProps={{
                                    endAdornment: <NumberInputAdornment />,
                                }}
                                name={STUDY_UNEXPOSED_DAYS_AFTER_EXPOSURE}
                                onChange={e => {
                                    unexposed.set("matPriExpoAftDays", Number(e.target.value));
                                }}
                                min="0"
                                max="36500"
                                disabled={modifyMode}
                            />
                        </Row>

                        <br />
                    </>
                ) : null}

                <Row
                    label="Do you want results based on propensity score matching ?"
                    itemSizeOne={8}
                    itemSizeTwo={3}
                >
                    <Radiogroup
                        name="radioStudyMatchPropensityScore"
                        value={propensityScore}
                        handleChange={e => {
                            unexposed.set("propensityScore", stringToBoolean(e.target.value));
                            if (e.target.value === "true" && cCount < 10) {
                                setControlCount("10");
                            }
                        }}
                        radioOptions={radioOptionsExposedYesNo}
                        disabled={modifyMode}
                    />
                </Row>
            </div>
        </>
    );
});

export const MatchControlNeeded = observer(
    ({ unexposed, studyHasExposure, studyHasControl, mode, studyDesign }) => {
        const { matchCtrls } = unexposed.data;
        const disableMatch = studyHasExposure === false || studyHasControl === false;
        if (disableMatch) {
            unexposed.set("matchCtrls", false);
        }

        const matchHeading = studyDesign === COHORT ? "Matching" : "Match Control";

        return (
            <>
                <CardHeader title={matchHeading} />
                <div style={{ marginLeft: "10px", width: "50%" }}>
                    <br />
                    <FormLabel component="legend">{STUDY_NEED_UN_EXPOSURE_MATCH}</FormLabel>
                    <Radiogroup
                        // disabled={studyHasExposure === "0" ? true : false}
                        disabled={disableMatch || mode === "modify"}
                        value={matchCtrls === undefined ? false : matchCtrls}
                        handleChange={e =>
                            unexposed.set("matchCtrls", stringToBoolean(e.target.value))
                        }
                        radioOptions={radioOptionsMatchPrimaryExposureOnlyYesNo}
                    />
                </div>
            </>
        );
    }
);

export const Match = observer(props => {
    const classes = useStyles();
    const { unexposed } = props;

    React.useEffect(() => {
        unexposed.create();
    }, [unexposed]);

    const { matchCtrls } = props.unexposed.data;

    return (
        <>
            <Paper className={classes.paper}>
                <MatchControlNeeded {...props} />
            </Paper>
            <br />
            {matchCtrls === true ? (
                <>
                    <Paper className={classes.paper}>
                        <AddCodesAndDisplayTables {...props} />
                    </Paper>
                    <br />
                    <Paper className={classes.paperForMatching}>
                        <MatchControl {...props} />
                    </Paper>
                    <br />
                </>
            ) : null}
        </>
    );
});
