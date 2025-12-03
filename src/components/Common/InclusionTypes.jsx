import React from "react";

export const InclusionTypes = ({ mode = false, tab }) => {
    return (
        <>
            <option value={1} disabled={mode}>
                1 - Incident event only (participants with prevalent event will be excluded)
            </option>
            <option value={2} disabled={mode}>
                2 - First event after registration into practice
            </option>
            <option value={tab === "Exposure" ? 4 : 3} disabled={mode}>
                3 - First ever event (incident and prevalent)
            </option>
        </>
    );
};
