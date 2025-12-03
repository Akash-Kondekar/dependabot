import React from "react";
import { LoadWizard } from "./Wizard";
import job from "../../state/store/study/job";
import { observer } from "mobx-react";
import session from "../../state/store/session";
import { JOB_STATUS } from "../../constants";

// const StoreContext = React.createContext();

// const rootStore = {
//   period,
// };

export const LoadJob = observer(
    ({
        projectID,
        // setDisplayNewStudy,
        projectName,
        studyID,
        // studyDesign,
        mode,
        setStudyID,
        addonMode,
        jobUUID,
    }) => {
        React.useEffect(() => {
            // TODO
            // TODO I need to load a Job, when addonMode is undefined.
            // TODO if addonMode is Create --> load the Job and get DataExtractionReport and Pass it Further.
            // TODO if addonMode is Load, --> load the AddOn itself, get DataExtractionReport and Pass it Further.

            (async () => {
                if (addonMode === undefined && studyID) {
                    await job.load(projectID, studyID, mode); // Load the Study
                }
                if (addonMode === "load") {
                    // TODO if addonMode is Load, --> load the AddOn itself, get DataExtractionReport and Pass it Further.
                    await job.load(projectID, studyID, mode, "load");
                }
                if (addonMode === "create") {
                    // TODO if addonMode is Load, --> load the Job and get DataExtractionReport and Pass it Further.
                    await job.load(projectID, studyID, mode, "create");
                }

                // if (studyID) {
                //   if (addonMode === "load") {
                //     await job.load(projectID, studyID, "modify"); // Load the AddOn
                //   } else {
                //     await job.load(projectID, studyID, mode); // Load the Study
                //   }
                // }
            })();
        }, [projectID, studyID, addonMode, mode]);

        // React.useEffect(() => {
        //   (async () => {
        //     const results = await job.load(projectID, studyID);
        //   })();
        // }, [projectID, job, projectID]);

        return job.loading === false ? (
            <LoadWizard
                projectName={projectName}
                projectID={projectID}
                // setDisplayNewStudy={setDisplayNewStudy}
                id={studyID}
                mode={mode}
                // studyDesign={studyDesign} // TODO Probably I need to take from Job store. job.data.studyObject.studyPeriod.studyDesign
                studyDesign={job?.data?.studyObject?.studyPeriod?.studyDesign}
                setStudyID={setStudyID}
                addonMode={addonMode}
                jobUUID={jobUUID}
                isDraft={
                    job?.data?.status === JOB_STATUS.DRAFT &&
                    job?.data?.submittedByUserID === session.loggedInUser
                }
            />
        ) : (
            "loading....."
        );
    }
);

export const Study = observer(
    ({
        projectID,
        // setDisplayNewStudy,
        projectName,
        studyID,
        studyDesign,
        mode,
        setStudyID,
        addonMode,
        jobUUID,
    }) => {
        // React.useEffect(() => {
        //   (async () => {
        //     if (studyID) {
        //       await job.load(projectID, studyID);
        //     }
        //   })();
        // }, [projectID, studyID]);

        React.useEffect(() => {
            //force menu to minimize while designing study
            session.setDrawerStatus(false);
        }, []);

        return studyID === null && addonMode === undefined ? (
            <LoadWizard
                projectName={projectName}
                projectID={projectID}
                // setDisplayNewStudy={setDisplayNewStudy}

                id={studyID}
                mode={mode}
                studyDesign={studyDesign}
                setStudyID={setStudyID}
                addonMode={addonMode}
            />
        ) : (
            <LoadJob
                projectName={projectName}
                projectID={projectID}
                // setDisplayNewStudy={setDisplayNewStudy}
                studyID={studyID}
                mode={mode}
                studyDesign={job?.data?.studyObject?.studyPeriod?.studyDesign}
                setStudyID={setStudyID}
                addonMode={addonMode}
                jobUUID={jobUUID}
            />
        );
        // </StoreContext>
    }
);
