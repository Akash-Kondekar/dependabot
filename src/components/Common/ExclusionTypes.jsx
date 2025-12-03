import React from "react";

export const ExclusionTypes = ({ mode = false }) => {
    return (
        <>
            <option value={1} disabled={mode}>
                1 - This Exposure was ever recorded
            </option>
            <option value={2} disabled={mode}>
                2- This Exposure occurs before their Index Date
            </option>
            <option value={3} disabled={mode}>
                3 - This exposure occurred within a certain time before their index date
            </option>
        </>
    );
};
