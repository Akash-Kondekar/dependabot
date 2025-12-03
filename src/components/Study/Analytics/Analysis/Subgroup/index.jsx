import React from "react";
import analysisStore from "../../../../../state/store/study/analytics/analysis";
import { observer } from "mobx-react";
import { NoData } from "../../../../Common";
import { Grid2 as Grid } from "@mui/material";
import DisplaySubgroupAnalysis from "./DisplaySubgroupAnalysis";
import { AnalysisFilters } from "../Common";
import commonStore from "../../../../../state/store/study/analytics/common";

const SubgroupAnalysisMain = observer(() => {
    const { type, displayLabel, displayName, groups, subgroups } = analysisStore;

    const { variableList, displayGraph, currentCondition } = commonStore;

    React.useEffect(() => {
        analysisStore.reset();

        (async () => {
            variableList.length > 0 &&
                (await analysisStore.loadSubgroups(currentCondition?.conditionsSelected));
        })();
    }, [variableList]);

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
                    <DisplaySubgroupAnalysis
                        subgroupData={analysisStore.analysisList}
                        type={type}
                        displayGraph={displayGraph}
                        displayLabel={displayLabel}
                        displayName={displayName}
                        groups={groups}
                        subgroups={subgroups}
                    />
                ) : (
                    <NoData message="No Subgroup data available" />
                )}
            </Grid>
        </Grid>
    );
});

export default SubgroupAnalysisMain;
