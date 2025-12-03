import React from "react";
import { observer } from "mobx-react";
import { Paper } from "@mui/material";
import { colorPalette, DisplayAnalysisResultTable } from "../Common";
import commonStore from "../../../../../state/store/study/analytics/common";
import { INCIDENCE_PREVALENCE_OPTIONS } from "../../../../../constants";

// Import the basic distribution and create a plotly component
import Plotly from "plotly.js-basic-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);

const DisplayOverallAnalysis = observer(props => {
    const { overallData, type, displayGraph, displayLabel, displayName } = props;
    const { personYears, personYearsDisplayLabel } = commonStore;

    const plotLayout = {
        title: { text: `Overall ${displayLabel}`, subtitle: { text: "" } },
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
    };

    const conditions = [
        ...new Set(
            overallData?.map(item => {
                return item?.condition;
            })
        ),
    ];

    const getPlotData = () => {
        const plotData = [];
        for (let i = 0; i < conditions.length; i++) {
            const data = overallData.filter(record => {
                return record?.condition === conditions[i];
            });

            const trace = {
                x: data?.map(item => {
                    return item?.date;
                }),
                y: data?.map(item => {
                    return (Math.round(item[displayName] * personYears * 100) / 100).toFixed(2);
                }),
                name: conditions[i],
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
                                (Math.round(item?.upperCi * personYears * 100) / 100).toFixed(2) -
                                (Math.round(item[displayName] * personYears * 100) / 100).toFixed(2)
                            );
                        }
                    }),
                    arrayminus: data?.map(item => {
                        if (item?.numerator === 0.0 && item?.denominator === 0.0) {
                            return 0.0;
                        } else {
                            return (
                                (Math.round(item[displayName] * personYears * 100) / 100).toFixed(
                                    2
                                ) - (Math.round(item?.lowerCi * personYears * 100) / 100).toFixed(2)
                            );
                        }
                    }),
                    visible: true,
                },
            };
            plotData.push(trace);
        }
        return plotData;
    };

    return (
        <div>
            <div style={{ paddingTop: "50px" }}>
                {displayGraph ? (
                    <Paper>
                        <Plot
                            data={getPlotData()}
                            layout={plotLayout}
                            config={{
                                editable: true,
                                displayModeBar: false,
                                useResizeHandler: true,
                            }}
                            style={{ width: "90%", height: "100%", margin: "0 auto" }}
                        />
                    </Paper>
                ) : (
                    <DisplayAnalysisResultTable />
                )}
            </div>
        </div>
    );
});

export default DisplayOverallAnalysis;
