import React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { observer } from "mobx-react";
import jobStatus from "../../state/store/study/job-status";
import { Confirm } from "../../componentsV2/Common/Confirm";
import { ShowSuccess } from "../../componentsV2/Common/Toast";

export const ApplicationStatus = observer(() => {
    React.useEffect(() => {
        jobStatus.load();
    }, []);

    const handleChange = async event => {
        //TODO Post is failing with a CORS Error - Need to Check Why !

        const value = event.target.checked.toString();
        const { isConfirmed } = await Confirm(
            "Change Job Submission Status",
            "Are you sure you want to perform this action"
        );

        if (isConfirmed) {
            await jobStatus.save({
                allowjobsubmission: value,
            });
            ShowSuccess("Update Successful");
        }
    };

    return (
        <FormGroup row>
            <FormControlLabel
                control={
                    <Switch
                        disabled={jobStatus.loading}
                        checked={jobStatus.data.allowjobsubmission === "true"}
                        onChange={handleChange}
                        name="dexterStatus"
                        color="primary"
                    />
                }
                label="Allow Jobs to be submitted"
            />
        </FormGroup>
    );
});

// export const ApplicationStatus = () => <div>Application Status</div>;
