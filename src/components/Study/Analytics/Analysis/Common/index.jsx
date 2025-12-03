import React from "react";
import { observer } from "mobx-react";
import { Paper, Stack, Switch, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import analysisStore, { INITIAL_OPTION } from "../../../../../state/store/study/analytics/analysis";
import { BasicButton, DisplayDataTable, Dropdown } from "../../../../Common";
import { formatDateFieldAndAddSlNo, isDeepEqual } from "../../../../../utils";
import {
    INCIDENCE,
    INCIDENCE_PREVALENCE_OPTIONS,
    MUIDataTableDefaultOptions,
    PREVALENCE,
} from "../../../../../constants";
import commonStore, {
    INITIAL_PERSON_YEARS,
} from "../../../../../state/store/study/analytics/common";
import { ShowWarning } from "../../../../../componentsV2/Common/Toast";

export const INC_PREV_DROPDOWN_DATA = [
    { label: INCIDENCE, value: INCIDENCE },
    { label: PREVALENCE, value: PREVALENCE },
];

export const PERSON_YEARS_DROPDOWN_OPTIONS = [
    { label: "1000", value: 1.0 },
    { label: "100,000", value: 100.0 },
];
export const colorPalette = [
    "#8dd3c7",
    "#ffd24d",
    "#bebada",
    "#fb8072",
    "#e27a03",
    "#b3de69",
    "#f99fce",
    "#a6a6a6",
    "#bc80bd",
    "#1affb2",
    "#e6e600",
    "#3399ff",
    "#cc33ff",
    "#b3d9ff",
    "#b2df8a",
    "#e63900",
    "#ffbe99",
    "#e6b3ff",
    "#cfbbb0",
    "#bf4080",
    "#809fff",
    "#cc9900",
    "#e600e6",
    "#e7298a",
    "#666666",
    "#a52a2a",
    "#ed5ab2",
    "#B5975C",
    "#00b300",
    "#4e79a7",
];

export const AnalysisFilters = observer(() => {
    const [personYears, setPersonYears] = React.useState(commonStore.personYears);
    const [currentCondition, setCurrentCondition] = React.useState(commonStore.currentCondition);
    const [type, setType] = React.useState(analysisStore.type);
    const [invokeAnalysisAPI, setInvokeAnalysisAPI] = React.useState(false);

    const { variableList, displayGraph } = commonStore;
    const location = useLocation();

    const title = location?.state?.title;

    const currentTheme = useTheme();

    const isSubgroup = title === INCIDENCE_PREVALENCE_OPTIONS.SUBGROUP.LABEL;
    const isOverall = title === INCIDENCE_PREVALENCE_OPTIONS.OVERALL.LABEL;

    const theme = createTheme({
        palette: {
            mode: currentTheme.palette.mode,
        },
        components: {
            MuiFormControl: {
                styleOverrides: {
                    root: {
                        minWidth: "30%",
                        marginLeft: "0px !important",
                        maxWidth: "30%",
                    },
                },
            },
        },
    });

    const conditionOptions = variableList?.map(item => {
        return { value: item, label: item };
    });

    const groupOptions = analysisStore.groups?.map(item => {
        return { value: item, label: item };
    });

    const handleIncPrevChange = async e => {
        setType(e.target.value);
        setInvokeAnalysisAPI(e.target.value !== analysisStore.type);
    };

    const handlePersonYearsChange = e => {
        setPersonYears(e.target.value);
    };

    const toggleSwitch = e => {
        commonStore.setDisplayGraph(e.target.checked);
    };

    const handleConditionChange = async value => {
        if (value?.length > 5) {
            return ShowWarning("Please select any 5 conditions");
        }

        setInvokeAnalysisAPI(!isDeepEqual(value, commonStore.currentCondition?.conditionsSelected));

        setCurrentCondition({
            ...currentCondition,
            conditionsSelected: value,
        });
    };

    const handleGroupChange = value => {
        setCurrentCondition({
            ...currentCondition,
            groupSelected: value,
        });
    };

    const handleApplyFilters = async () => {
        analysisStore.setType(type);
        commonStore.setCurrentCondition(currentCondition);
        commonStore.setPersonYears(personYears);

        if (invokeAnalysisAPI) {
            if (isOverall) {
                await analysisStore.loadOverall();
            }

            if (isSubgroup) {
                await analysisStore.loadSubgroups(currentCondition.conditionsSelected);
            }
        }

        setInvokeAnalysisAPI(false);
    };

    const handleClearFilters = () => {
        setPersonYears(INITIAL_PERSON_YEARS);
        setCurrentCondition();
        setType(INITIAL_OPTION);

        analysisStore.reset();
        commonStore.reset();
    };

    const hasVariables = isSubgroup && variableList?.length > 0;

    const displayGroupFilter = hasVariables && displayGraph && groupOptions?.length > 0;

    return (
        <Paper sx={{ padding: "2%" }}>
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ flexWrap: "wrap", rowGap: "20px", columnGap: "8px" }}
            >
                <ThemeProvider theme={theme}>
                    <Dropdown
                        ddLabel="Inc_Prev"
                        labelName="Inc_Prev"
                        labelValue="Inc_Prev"
                        value={type}
                        handleChange={e => handleIncPrevChange(e)}
                        dropdownOptions={INC_PREV_DROPDOWN_DATA}
                        fullWidth={false}
                    />

                    {hasVariables && (
                        <Dropdown
                            ddLabel="Select Condition(s)"
                            labelName="Select Condition(s)"
                            labelValue="Select Condition(s)"
                            value={currentCondition?.conditionsSelected ?? []}
                            handleChange={e => handleConditionChange(e.target.value)}
                            dropdownOptions={conditionOptions}
                            multiple={true}
                            fullWidth={false}
                        />
                    )}

                    {displayGroupFilter && (
                        <Dropdown
                            ddLabel="Select Group(s)"
                            labelName="Select Group(s)"
                            labelValue="Select Group(s)"
                            value={currentCondition?.groupSelected ?? []}
                            handleChange={e => handleGroupChange(e.target.value)}
                            dropdownOptions={groupOptions}
                            multiple={true}
                            fullWidth={false}
                            sx={{ marginLeft: "0px" }}
                        />
                    )}

                    <Dropdown
                        ddLabel="Person Years"
                        labelName="Person Years"
                        labelValue="Person Years"
                        value={personYears}
                        handleChange={e => handlePersonYearsChange(e)}
                        dropdownOptions={PERSON_YEARS_DROPDOWN_OPTIONS}
                        fullWidth={false}
                    />
                </ThemeProvider>

                <Stack direction="row" spacing={1} alignItems="center">
                    <Switch checked={displayGraph} onChange={e => toggleSwitch(e)} />
                    <Typography>Graph</Typography>
                </Stack>
                <BasicButton
                    variant="outlined"
                    color="primary"
                    handleClick={() => handleClearFilters()}
                    buttonText="Clear"
                />

                <BasicButton
                    variant="contained"
                    color="primary"
                    handleClick={() => handleApplyFilters()}
                    buttonText="Apply"
                    disabled={!isOverall && !hasVariables} //Subgroup is dependant on variables, when variables list is empty API call should not happen
                />
            </Stack>
        </Paper>
    );
});

export const DisplayAnalysisResultTable = observer(() => {
    const { displayLabel, displayName, analysisList } = analysisStore;
    const { personYears } = commonStore;

    const location = useLocation();

    const title = location?.state?.title;

    const isSubgroup = title === INCIDENCE_PREVALENCE_OPTIONS.SUBGROUP.LABEL;

    const overallIncPrevTableColumns = [
        {
            label: "Condition",
            name: "condition",
        },
        { label: "Date", name: "date" },
        {
            label: "Group",
            name: "group",
        },
        {
            label: "Subgroup",
            name: "subgroup",
            options: {
                display: isSubgroup,
            },
        },
        {
            label: displayLabel,
            name: displayName,
        },

        {
            label: "Numerator",
            name: "numerator",
        },
        {
            label: "Denominator",
            name: "denominator",
        },
        {
            label: "LowerCi",
            name: "lowerCi",
        },
        {
            label: "UpperCi",
            name: "upperCi",
        },
    ];

    const updatedData = analysisList?.map(entry => {
        const newEntry = {
            ...entry,
            incidence: (Math.round(entry.incidence * personYears * 100) / 100).toFixed(2),
            prevalence: (Math.round(entry.prevalence * personYears * 100) / 100).toFixed(2),
            lowerCi: (Math.round(entry.lowerCi * personYears * 100) / 100).toFixed(2),
            upperCi: (Math.round(entry.upperCi * personYears * 100) / 100).toFixed(2),
        };

        return newEntry;
    });

    return (
        <DisplayDataTable
            title="Analysis"
            columns={overallIncPrevTableColumns}
            data={formatDateFieldAndAddSlNo(updatedData, "date")}
            options={MUIDataTableDefaultOptions}
        />
    );
});
