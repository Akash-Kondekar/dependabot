import React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { observer } from "mobx-react";
import systemConfiguration from "../../state/store/admin/systemConfiguration";
import { useNavigate } from "react-router-dom";
import { Confirm } from "../../componentsV2/Common/Confirm";
import { ShowSuccess } from "../../componentsV2/Common/Toast";

export const ToggleDesign = observer(() => {
    const navigate = useNavigate();
    React.useEffect(() => {
        systemConfiguration.load();
    }, []);

    const handleChange = async event => {
        const value = event.target.checked.toString();
        const { isConfirmed } = await Confirm(
            "Switch Design",
            "Are you sure you want to perform this action"
        );

        if (isConfirmed) {
            await systemConfiguration.save({ key: "toggleNewDesign", value: value });

            ShowSuccess("Update Successful");

            navigate("/login");
            navigate(0);
        }
    };

    return (
        <FormGroup row>
            <FormControlLabel
                control={
                    <Switch
                        disabled={systemConfiguration.loading}
                        checked={systemConfiguration.data === "true"}
                        onChange={handleChange}
                        name="dexterStatus"
                    />
                }
                label="Switch to New Design"
                sx={{ color: "primary.main" }}
            />
        </FormGroup>
    );
});
