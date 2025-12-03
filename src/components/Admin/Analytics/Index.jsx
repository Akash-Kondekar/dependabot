import React from "react";
import { Analytics } from "./Analytics";

import { observer } from "mobx-react";
import analytics from "../../../state/store/admin/analytics";

export const AnalyticsMain = observer(() => {
    React.useEffect(() => {
        analytics.reset(); // clear data from cache (if any) before calling the API
        analytics.load();
    }, []);

    if (analytics.loading) {
        return "Loading...";
    }

    return <Analytics results={analytics.analyticsJobs} />;
});
