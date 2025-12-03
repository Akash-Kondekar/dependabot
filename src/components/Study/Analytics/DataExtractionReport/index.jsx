import React from "react";
import dataextractionreport from "../../../../state/store/study/analytics/data-extraction-report";
import { observer } from "mobx-react";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { NoData, Radiogroup } from "../../../Common";
import { DataExtractionTimelinePlot, DisplayFlowChart } from "./DisplayDataExtractionPlot";
import { ReactFlowProvider } from "reactflow";
import { radioOptionsFlowchartOrText } from "../../../../constants/index.jsx";
import Grid from "@mui/material/Grid2";

const DataExtractionReport = observer(({ data }) => {
    const [displayFlowChart, setDisplayFlowChart] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            await dataextractionreport.load(data);
        })();
    }, []);

    if (dataextractionreport.loading) {
        return "Loading...";
    }

    if (Object.keys(dataextractionreport.data)?.length === 0) {
        return (
            <Grid container justifyContent="center" sx={{ paddingTop: "3rem" }}>
                <Grid
                    size={{
                        xs: 12,
                        md: 11,
                        lg: 11,
                        xl: 10,
                    }}
                >
                    <NoData message="Study design data is not available" />
                </Grid>
            </Grid>
        );
    }

    return (
        <Grid container justifyContent="center" sx={{ paddingTop: "1rem" }}>
            <Grid
                size={{
                    xs: 12,
                    md: 12,
                    lg: 11,
                    xl: 11,
                }}
            >
                <FormControl>
                    <FormLabel sx={{ marginBottom: 1 }}>Study participant flow</FormLabel>
                    <Radiogroup
                        radioOptions={radioOptionsFlowchartOrText}
                        value={displayFlowChart}
                        aria-labelledby="radio-buttons-data-flow-label"
                        handleChange={() => setDisplayFlowChart(!displayFlowChart)}
                    />
                </FormControl>
                {displayFlowChart ? (
                    <ReactFlowProvider>
                        <DisplayFlowChart />
                    </ReactFlowProvider>
                ) : (
                    <DataExtractionTimelinePlot />
                )}
            </Grid>
        </Grid>
    );
});

export default DataExtractionReport;
