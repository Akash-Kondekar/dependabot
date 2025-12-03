import React from "react";
import { observer } from "mobx-react";
import {
    JOBS,
    LOADING,
    NO_RECORDS_FOUND,
    radioOptionsJobsAndAddons,
    TITLE_ADDONS,
    TITLE_JOBS,
} from "../../../constants";
import adminJobsAndAddons from "../../../state/store/admin/allJobsAndAddOns";
import { Radiogroup } from "../../Common";
import { JobsAndAddOns } from "./JobsAndAddOns";
import PropTypes from "prop-types";

export const JobsAddonsMain = observer(() => {
    const [jobType, setJobType] = React.useState(JOBS);

    const handleChange = input => {
        setJobType(input);
    };

    React.useEffect(() => {
        adminJobsAndAddons.load(jobType);
    }, [jobType]);

    const updateStatus = async (projectId, jobID, newStatus, jobType) => {
        return await adminJobsAndAddons.update(projectId, jobID, newStatus, jobType);
    };

    if (adminJobsAndAddons.loading) {
        return LOADING;
    }

    return (
        <>
            <DisplayRadioOption jobType={jobType} handleChange={handleChange} />
            {!adminJobsAndAddons.loading && adminJobsAndAddons.list.length === 0 ? (
                NO_RECORDS_FOUND
            ) : (
                <JobsAndAddOns
                    results={adminJobsAndAddons.list}
                    title={jobType === JOBS ? TITLE_JOBS : TITLE_ADDONS}
                    updateStatus={updateStatus}
                    jobType={jobType}
                />
            )}
        </>
    );
});

export const DisplayRadioOption = ({ jobType, handleChange }) => {
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

DisplayRadioOption.propTypes = {
    jobType: PropTypes.string,
    handleChange: PropTypes.func,
};
