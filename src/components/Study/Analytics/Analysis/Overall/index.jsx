import React from "react";
import analysisStore from "../../../../../state/store/study/analytics/analysis";
import { observer } from "mobx-react";
import { NoData } from "../../../../Common";
import { Grid2 as Grid } from "@mui/material";
import { AnalysisFilters } from "../Common";
import DisplayOverallAnalysis from "./DisplayOverallAnalysis";
import commonStore from "../../../../../state/store/study/analytics/common";

const OverallAnalysisMain = observer(() => {
    const { type, displayLabel, displayName } = analysisStore;

    React.useEffect(() => {
        analysisStore.reset();

        (async () => {
            await analysisStore.loadOverall(analysisStore.type);
        })();
    }, []);

    if (analysisStore.busy) {
        return "Loading...";
    }

    return (
        <Grid container justifyContent={"center"} sx={{ paddingTop: "3rem" }}>
            <Grid
                size={{
                    xs: 12,
                    md: 11,
                    lg: 11,
                    xl: 10,
                }}
            >
                <AnalysisFilters />
                {analysisStore.analysisList?.length > 0 ? (
                    <DisplayOverallAnalysis
                        overallData={analysisStore.analysisList}
                        type={type}
                        displayGraph={commonStore.displayGraph}
                        displayLabel={displayLabel}
                        displayName={displayName}
                    />
                ) : (
                    <NoData message="No Overall data available" />
                )}
            </Grid>
        </Grid>
    );
});

export default OverallAnalysisMain;
