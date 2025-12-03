import React from "react";
import { Studies } from "./Studies";

import { observer } from "mobx-react";
import adminJobs from "../../../state/store/admin/jobs";
import { JOBS, radioOptionsJobsAndAddons } from "../../../constants";
import { Radiogroup } from "../../Common";

const DisplayRadioOption = ({ jobType, handleChange }) => {
    return (
        <div>
            <Radiogroup
                value={jobType}
                handleChange={e => handleChange(e.target.value)}
                radioOptions={radioOptionsJobsAndAddons}
            />
        </div>
    );
};

export const StudiesMain = observer(() => {
    const [type, setType] = React.useState(JOBS);

    React.useEffect(() => {
        adminJobs.load(type);
    }, [type]);

    const handleChange = input => {
        setType(input);
    };

    const updateStatus = async (projectId, jobID, newStatus, type) => {
        await adminJobs.update(projectId, jobID, newStatus, type);
    };

    const updatePriority = async (projectId, jobID, newPriority, type) => {
        await adminJobs.updatePriority(projectId, jobID, newPriority, type);
    };

    if (adminJobs.loading) {
        return "Loading...";
    }

    return (
        <>
            <DisplayRadioOption jobType={type} handleChange={handleChange} />

            <Studies
                jobType={type}
                results={adminJobs.list}
                updateStatus={updateStatus}
                updatePriority={updatePriority}
            />
        </>
    );
});
