import React from "react";
import period from "../../../state/store/study/period";
import { CROSS_SECTIONAL, radioOptionsDatabaseTypes } from "../../../constants";
import { Typography } from "@mui/material";
import studyDatabase from "../../../state/store/study/database";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import { BasicInfoCard } from "../../Common/BasicInfoCard";

const StudyPeriodSummary = ({ setStep = undefined }) => {
    const { studyStart, studyEnd, practiceOption, studyDesign } = period.data;

    const setTheStep = step => {
        setStep(step);
    };

    let database = studyDatabase.dbDetailsSummary();

    if (database === undefined || database?.name === undefined) {
        database = studyDatabase.dbDetails(studyDatabase.data?.id);
    }

    const practiceOptionLabel = radioOptionsDatabaseTypes.find(
        option => option.value === practiceOption
    )?.label;

    const Header = () => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
            }}
        >
            <span>Study Details</span>
            {setStep && (
                <IconButton aria-label="edit">
                    <EditIcon onClick={() => setTheStep(0)} />
                </IconButton>
            )}
        </div>
    );

    const Content = () => (
        <>
            <div>
                <Typography gutterBottom variant="h6" component="h4">
                    Database
                </Typography>
                {`This `}
                <strong>
                    {practiceOptionLabel === "Select All Practices"
                        ? "All Practices"
                        : practiceOptionLabel}
                </strong>
                {` study will be done in the `}
                <strong>{database?.name} </strong>
                {`Database ( version `}
                <strong>{database?.version} </strong> ){" "}
            </div>

            <div style={{ marginTop: "20px" }}>
                <Typography gutterBottom variant="h6" component="h4">
                    Study Period
                </Typography>
                Study details starts from
                <strong> {studyStart} </strong>
                {studyDesign !== CROSS_SECTIONAL && (
                    <span>
                        and ends on<strong> {studyEnd} </strong>
                    </span>
                )}
            </div>
        </>
    );

    return <BasicInfoCard Header={Header} Content={Content} />;
};

export default StudyPeriodSummary;
