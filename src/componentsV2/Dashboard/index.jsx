import React from "react";
import { NewUserDashboard } from "./NewUser.jsx";
import { CommonDashboard } from "./Common.jsx";
import NonAdminDashboard from "./NonAdmin/index.jsx";
import { AdminDashboard } from "./Admin.jsx";
import { observer } from "mobx-react";
import jobStatus from "../../state/store/study/job-status.js";
import broadcastStore from "../../state/store/admin/broadcast.js";
import DashboardSkeleton from "../Skeletons/DashboardSkeleton.jsx";
import session from "../../state/store/session.js";
import dashboard from "../../state/store/dashboard.js";

const Dashboard = observer(() => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(
            jobStatus.loading || broadcastStore.busy || (!session.isAdmin && dashboard.busy)
        );
    }, [jobStatus.loading, broadcastStore.busy, session.isAdmin, dashboard.busy]);

    return (
        <>
            {loading && <DashboardSkeleton />}
            <CommonDashboard />
            <NonAdminDashboard />
            <AdminDashboard />
            <NewUserDashboard />
        </>
    );
});
export default Dashboard;
