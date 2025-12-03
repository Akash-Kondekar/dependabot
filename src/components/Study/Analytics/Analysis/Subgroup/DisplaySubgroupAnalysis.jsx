import React from "react";
import { observer } from "mobx-react";
import { Paper } from "@mui/material";
import { INCIDENCE_PREVALENCE_OPTIONS } from "../../../../../constants";
import { colorPalette, DisplayAnalysisResultTable } from "../Common";
import commonStore from "../../../../../state/store/study/analytics/common";

// Import the basic distribution and create a plotly component
import Plotly from "plotly.js-basic-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);

const DisplaySubgroupPlot = props => {
    const { currentPageData, personYears } = props;
    return (
        <Paper
            sx={{
                marginTop: "20px",
                marginBottom: "20px",
                paddingLeft: "1%",
                paddingRight: "1%",
            }}
        >
            <div style={{ paddingTop: "70px" }}>
                {currentPageData?.map((item, index) => {
                    return (
                        <div key={`${item.condition}-${index}-${personYears}`}>
                            <Plot
                                data={item.plotData}
                                layout={item.layout}
                                config={{
                                    editable: true,
                                    displayModeBar: false,
                                    useResizeHandler: true,
                                }}
                                style={{ width: "90%", height: "100%" }}
                            />
                        </div>
                    );
                })}
            </div>
        </Paper>
    );
};

const DisplaySubgroupAnalysis = observer(props => {
    const { subgroupData, type, displayGraph, displayName, groups, subgroups } = props;

    const { personYears, personYearsDisplayLabel, variableList, currentCondition } = commonStore;

    const conditions = variableList;

    const getPlotData = () => {
        const plot_data = [];

        for (let i = 0; i < conditions.length; i++) {
            for (let j = 0; j < groups.length; j++) {
                const traces = [];
                for (let k = 0; k < subgroups.length; k++) {
                    const data = subgroupData.filter(record => {
                        return (
                            record?.condition === conditions[i] &&
                            record?.group === groups[j] &&
                            record.subgroup === subgroups[k]
                        );
                    });
                    const trace = {
                        x: data?.map(item => {
                            return item?.date;
                        }),
                        y: data?.map(item => {
                            return (
                                Math.round(item[displayName] * personYears * 100) / 100
                            ).toFixed(2);
                        }),
                        name: subgroups[k],
                        mode: "lines+markers",
                        type: "scatter",
                        error_y: {
                            type: "data",
                            symmetric: false,
                            array: data?.map(item => {
                                if (
                                    Math.round(item?.numerator * 100) / 100 === 0.0 &&
                                    Math.round(item?.denominator * 100) / 100 === 0.0
                                ) {
                                    return 0.0;
                                } else {
                                    return (
                                        (
                                            Math.round(item?.upperCi * personYears * 100) / 100
                                        ).toFixed(2) -
                                        (
                                            Math.round(item[displayName] * personYears * 100) / 100
                                        ).toFixed(2)
                                    );
                                }
                            }),
                            arrayminus: data?.map(item => {
                                if (item?.numerator === 0.0 && item?.denominator === 0.0) {
                                    return 0.0;
                                } else {
                                    return (
                                        (
                                            Math.round(item[displayName] * personYears * 100) / 100
                                        ).toFixed(2) -
                                        (
                                            Math.round(item?.lowerCi * personYears * 100) / 100
                                        ).toFixed(2)
                                    );
                                }
                            }),
                            visible: true,
                        },
                    };
                    traces.push(trace);
                }
                plot_data.push({
                    condition: conditions[i],
                    group: groups[j],
                    plotData: traces,
                    layout: {
                        title: {
                            text:
                                type === INCIDENCE_PREVALENCE_OPTIONS.INCIDENCE.LABEL
                                    ? "Incidence trend for " + conditions[i] + " by " + groups[j]
                                    : "Prevalence trend for " + conditions[i] + " by " + groups[j],
                            subtitle: { text: "" },
                        },
                        colorway: colorPalette,
                        autosize: true,
                        xaxis: { title: { text: "Year" } },
                        yaxis: {
                            title: {
                                text:
                                    type === INCIDENCE_PREVALENCE_OPTIONS.INCIDENCE.LABEL
                                        ? `Incidence rate per ${personYearsDisplayLabel} person years`
                                        : `Prevalence proportion per ${personYearsDisplayLabel} persons`,
                            },
                        },
                    },
                });
            }
        }
        return plot_data;
    };

    const currentPageData = React.useMemo(() => {
        const plotJson = getPlotData();

        let data = plotJson;

        if (plotJson.length > 0) {
            if (
                currentCondition.conditionsSelected !== null &&
                currentCondition.conditionsSelected.length > 0
            ) {
                data = data.filter(record => {
                    return currentCondition.conditionsSelected.includes(record.condition);
                });
            }
            if (
                currentCondition.groupSelected !== null &&
                currentCondition.groupSelected.length > 0
            ) {
                data = data.filter(record => {
                    return currentCondition.groupSelected.includes(record.group);
                });
            }
        }

        return data;
    }, [currentCondition, personYears]);

    return (
        <div>
            {displayGraph ? (
                <DisplaySubgroupPlot currentPageData={currentPageData} personYears={personYears} />
            ) : (
                <div style={{ paddingTop: "70px" }}>
                    <DisplayAnalysisResultTable />
                </div>
            )}
        </div>
    );
});

export default DisplaySubgroupAnalysis;
