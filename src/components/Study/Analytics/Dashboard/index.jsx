import React from "react";
import { observer } from "mobx-react";

import commonStore from "../../../../state/store/study/analytics/common";
import DisplayOverallAnalysis from "../Analysis/Overall/DisplayOverallAnalysis";
import { INCIDENCE_PREVALENCE_OPTIONS } from "../../../../constants";
import { Grid2 as Grid } from "@mui/material";
import analysisStore from "../../../../state/store/study/analytics/analysis";
import { NoData } from "../../../Common";
import session from "../../../../state/store/session";

const DisplayOverallIncidencePlot = props => {
    const { incidenceData } = props;

    return (
        <div>
            {incidenceData?.length > 0 ? (
                <DisplayOverallAnalysis
                    overallData={incidenceData}
                    type={INCIDENCE_PREVALENCE_OPTIONS.INCIDENCE.LABEL}
                    displayGraph={true}
                    displayLabel={INCIDENCE_PREVALENCE_OPTIONS.INCIDENCE.LABEL}
                    displayName={INCIDENCE_PREVALENCE_OPTIONS.INCIDENCE.NAME}
                />
            ) : (
                <NoData message="No Overall Incidence data available" />
            )}
        </div>
    );
};

const DisplayOverallPrevalencePlot = props => {
    const { prevalenceData } = props;

    return (
        <div>
            {prevalenceData?.length > 0 ? (
                <DisplayOverallAnalysis
                    overallData={prevalenceData}
                    type={INCIDENCE_PREVALENCE_OPTIONS.PREVALENCE.LABEL}
                    displayGraph={true}
                    displayLabel={INCIDENCE_PREVALENCE_OPTIONS.PREVALENCE.LABEL}
                    displayName={INCIDENCE_PREVALENCE_OPTIONS.PREVALENCE.NAME}
                />
            ) : (
                <NoData message="No Overall Prevalence data available" />
            )}
        </div>
    );
};

const DisplayDashboard = observer(() => {
    const [overallIncidenceData, setOverallIncidenceData] = React.useState([]);
    const [overallPrevalenceData, setOverallPrevalenceData] = React.useState([]);

    const getDashboardData = async () => {
        await commonStore.load();

        analysisStore.setType(INCIDENCE_PREVALENCE_OPTIONS.INCIDENCE.LABEL);

        await analysisStore.loadOverall(session.checked);
        setOverallIncidenceData(analysisStore.analysisList);

        analysisStore.setType(INCIDENCE_PREVALENCE_OPTIONS.PREVALENCE.LABEL);

        await analysisStore.loadOverall(session.checked);
        setOverallPrevalenceData(analysisStore.analysisList);
    };

    React.useEffect(() => {
        getDashboardData();
    }, []);

    if (commonStore.loading || analysisStore.busy) {
        return "Loading...";
    }

    return (
        <div>
            <br />
            <Grid container justifyContent={"center"}>
                <Grid
                    size={{
                        xs: 12,
                        md: 11,
                        lg: 11,
                        xl: 10,
                    }}
                >
                    <DisplayOverallIncidencePlot incidenceData={overallIncidenceData} />
                    <DisplayOverallPrevalencePlot prevalenceData={overallPrevalenceData} />
                </Grid>
            </Grid>
        </div>
    );
});

export default DisplayDashboard;
